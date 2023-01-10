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

  if (process.env.NODE_ENV === "development") {
    // Create User
    const userData = {
      full_name: "User ICP Gahara",
      no_ktp: "1234567890654321",
      email: "user@icp-gahara.com",
      password: hashPassword,
      role: "user",
    };

    const user = await prisma.users.create({
      data: userData,
    });

    if (user) {
      console.log(`User ${user.email} created ! ✅`);
    }

    // Create Car
    const carData = {
      name: "Honda Jazz",
      description: "Mobil yang nyaman untuk keluarga",
      price: 1000000,
      seats: 5,
      image: "public/images/honda_jazz.png",
      type_fuel: "Bensin",
      type_car: "Family",
      transmision: "Manual",
    };

    const car = await prisma.cars.create({
      data: carData,
    });

    if (car) {
      console.log(`Car ${car.name} created ! ✅`);
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
