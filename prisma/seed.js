const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const main = async () => {
  //   Check Database
  const checkAdmin = await prisma.users.findFirst({
    where: { email: "admin@icp-gahara.com" },
  });

  if (!checkAdmin) {
    const genSalt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash("password", genSalt);

    // Create Admin
    const admin = {
      full_name: "Admin ICP Gahara",
      no_ktp: "1234567890123456",
      email: "admin@icp-gahara.com",
      password: hashPassword,
      role: "admin",
    };

    const adminUser = await prisma.users.create({
      data: admin,
    });

    if (adminUser) {
      console.log(`Admin ${adminUser.email} created ! ✅`);
    }
  }

  //   Check Location on Database
  const checkLocation = await prisma.location.findFirst();

  if (!checkLocation) {
    // Create Location
    const location = {
      address:
        "Jl. Laks Yos Sudaraso Gg III, No. 4 Sawahan, Lingkung Dua, Brotonegaran, Kec. Ponorogo, Kabupaten Ponorogo, Jawa Timur 63419",
      latitude: -7.8820775,
      longitude: 111.4581379,
    };

    const locationData = await prisma.location.create({
      data: location,
    });

    if (locationData) {
      console.log(`Location created ! ✅`);
    }
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
