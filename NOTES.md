STEPS TO ADD APPROVAL FOR AN ENTITY

STEP 1

Add System Approval in the SysApprovalSeeder forexample

     {
        name: 'Department Approval',
        description: 'Handles User approvals',
        entityName: 'Department',
      },

step 2

Declare approvalStatusUtil in the constructor of the service that u want to apply Approval forexample for department

```
constructor(
@InjectRepository(DepartmentEntity)
private readonly departmentRepository: Repository<DepartmentEntity>,
approvalStatusUtil: ApprovalStatusUtil
) {
super(departmentRepository, approvalStatusUtil, 'Department');
}
```
You can spot that we passed the utility class and the entity name that we have defined in the ApprovalSeder

Then in the responseDto of that entity you should expose approvalStatus property which will be empty

LAstly you just have to edit a place where u want to retrieve that approvalStatus

for example for department service

```
    return {
      ...response,
      data: response.data.map((user) => {
        const dto = DepartmentResponseDto.fromDepartment(user);
        dto.approvalStatus = (user as any).approvalStatus ?? 'N/A';
        return dto;
      }),
    };
    
```
  Thats it(3 minutes Tops)

IN FINDONE METHOD 

you just have to call a attachApprovalInfo method from baserService

then pass entity and approval entityName

```
    const departmentWithStatus = await this.attachApprovalInfo(
      department,
      'Department',
    );
```


/**
* Adjust approval level numbering intelligently.
* - When creating: assigns next available level number.
* - When deleting: shifts higher levels down by one.
    */
    private async updateApprovalLevelOrder(
    userApprovalId: string,
    action: 'CREATE' | 'DELETE',
    affectedLevel?: ApprovalLevel,
    ): Promise<number> {
    const levels = await this.approvalLevelRepository.find({
    where: { userApproval: { id: userApprovalId } },
    order: { level: 'ASC' },
    });

if (action === 'CREATE') {
// Just return next level number
return levels.length > 0 ? levels[levels.length - 1].level + 1 : 1;
}

if (action === 'DELETE' && affectedLevel) {
const deletedLevelNum = affectedLevel.level;

    // Shift all levels greater than deleted down by one
    for (const lvl of levels) {
      if (lvl.level > deletedLevelNum) {
        lvl.level -= 1;
        await this.approvalLevelRepository.save(lvl);
      }
    }

    return deletedLevelNum;
}

return 1;
}

level: await this.updateApprovalLevelOrder(userApprovalId, 'CREATE'),

async deleteApprovalLevel(id: string, soft = true): Promise<void> {
const level = await this.approvalLevelRepository.findOne({
where: { id },
relations: ['userApproval'], // we need the relation for reordering
});

if (!level) {
throw new NotFoundException(`ApprovalLevel with ID ${id} not found`);
}

await this.approvalLevelRepository.remove(level);

// Reorder remaining levels
await this.updateApprovalLevelOrder(level.userApproval.id, 'DELETE', level);
}