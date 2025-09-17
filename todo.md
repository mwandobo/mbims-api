    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
      relations: ['role'],
    });