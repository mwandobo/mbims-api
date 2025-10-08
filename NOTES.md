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

    // return {
    //   ...response,
    //   data: response.data.map((department) =>
    //     DepartmentResponseDto.fromDepartment(department),
    //   ),
    // };


    return {
      ...response,
      data: response.data.map((user) => {
        const dto = DepartmentResponseDto.fromDepartment(user);
        dto.approvalStatus = (user as any).approvalStatus ?? 'N/A';
        return dto;
      }),
    };
  Thats it(3 minutes Tops)

