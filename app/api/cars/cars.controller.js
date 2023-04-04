const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const prisma = new PrismaClient();

module.exports = {
  getCars: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const cars = await prisma.cars.findMany({
        include: {
          car_day_price: true,
          car_hour_price: true,
          car_images: true,
        },
      });

      const carsWithPrice = cars.map((car) => {
        const price_day = car.car_day_price.price;
        const price_hour = car.car_hour_price.map((price) => price.price);
        const prices_hour = Math.min.apply(null, price_hour);

        delete car.car_day_price;
        delete car.car_hour_price;

        return {
          ...car,
          price_day,
          prices_hour,
          image: car.car_images[0].image,
        };
      });

      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_CARS",
        data: carsWithPrice,
      });
    } catch (error) {
      console.error(error);

      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  getCar: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const { id } = req.params;

      const car = await prisma.cars.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          car_day_price: true,
          car_hour_price: true,
          car_images: true,
        },
      });

      if (!car) {
        throw {
          statusCode: 404,
          message: "CAR_NOT_FOUND",
        };
      }

      const price_day = car.car_day_price.price;
      const prices_hour = car.car_hour_price.map((price) => price.price);
      const price_hour = Math.min.apply(null, prices_hour);

      car.price_day = price_day;
      car.prices_hour = price_hour;
      car.image = car.car_images[0].image;

      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_CAR",
        data: car,
      });
    } catch (error) {
      console.error(error);

      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  createCar: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const {
        name,
        description,
        type_car,
        seats,
        type_fuel,
        transmision,
        price_day,
        prices_hour,
      } = req.body;

      if (req.files.length == 0) {
        throw {
          statusCode: 400,
          message: "REQUIRED_IMAGES",
        };
      }

      const result = await prisma.$transaction(async (prisma) => {
        const car = await prisma.cars.create({
          data: {
            name,
            description,
            seats: Number(seats),
            type_fuel,
            type_car,
            transmision,
            car_day_price: {
              create: {
                price: Number(price_day),
              },
            },
          },
        });

        if (prices_hour) {
          const prices_hour_array = JSON.parse(prices_hour);

          const prices = prices_hour_array.map((price) => {
            return {
              name: price.name,
              price: Number(price.price),
              car_id: car.id,
            };
          });

          await prisma.car_hour_price.createMany({
            data: prices,
          });
        }

        await Promise.all(
          req.files.map((file) => {
            return prisma.car_images.create({
              data: {
                image: file.path,
                car_id: car.id,
              },
            });
          })
        );

        const res = await prisma.cars.findUnique({
          where: {
            id: car.id,
          },
          include: {
            car_images: true,
          },
        });

        return res;
      });

      return res.status(201).json({
        status: true,
        message: "SUCCESS_CREATE_CAR",
        data: {
          ...result,
          image: result.car_images[0].image,
        },
      });
    } catch (error) {
      console.error(error);

      if (req.file) {
        const path = req.file.path;
        fs.unlinkSync(path);
      }

      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  updateCar: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const {
        name,
        description,
        seats,
        type_car,
        type_fuel,
        transmision,
        price_day,
        prices_hour,
      } = req.body;

      const { id } = req.params;

      const updateCar = await prisma.$transaction(async (prisma) => {
        const car = await prisma.cars.findUnique({
          where: {
            id: Number(id),
          },
        });

        if (!car) {
          throw {
            statusCode: 404,
            message: "CAR_NOT_FOUND",
          };
        }

        const carUpdate = await prisma.cars.update({
          where: {
            id: Number(id),
          },
          data: {
            name,
            description,
            seats: Number(seats),
            type_fuel,
            type_car,
            transmision,
            car_day_price: price_day
              ? {
                  update: {
                    price: Number(price_day),
                  },
                }
              : undefined,
          },
        });

        if (req.files) {
          await Promise.all(
            req.files.map((file) => {
              return prisma.car_images.create({
                data: {
                  image: file.path,
                  car_id: carUpdate.id,
                },
              });
            })
          );
        }

        const car_hour_prices = JSON.parse(prices_hour);

        // Get Old Hour Prices
        const old_prices_hour = await prisma.car_hour_price.findMany({
          where: {
            car_id: Number(id),
          },
        });

        // Filter Old Prices Hour
        const filter_old_prices_hour = old_prices_hour.filter((old_price) => {
          const find_price = car_hour_prices.find(
            (price) => Number(price.id) === old_price.id
          );

          return !find_price;
        });

        // Delete Old Prices Hour
        if (filter_old_prices_hour.length > 0) {
          await prisma.car_hour_price.deleteMany({
            where: {
              id: {
                in: filter_old_prices_hour.map((price) => price.id),
              },
            },
          });
        }

        if (car_hour_prices) {
          await Promise.all(
            car_hour_prices.map(async (price) => {
              if (price.id != undefined) {
                const checkIfPriceExist = await prisma.car_hour_price.findFirst(
                  {
                    where: {
                      id: Number(price.id),
                    },
                  }
                );

                if (!checkIfPriceExist) {
                  throw {
                    statusCode: 404,
                    message: "PRICE_NOT_FOUND",
                  };
                }

                await prisma.car_hour_price.update({
                  where: {
                    id: Number(price.id),
                  },
                  data: {
                    name: price.name,
                    price: Number(price.price),
                  },
                });
              } else {
                await prisma.car_hour_price.create({
                  data: {
                    name: price.name,
                    price: Number(price.price),
                    car_id: carUpdate.id,
                  },
                });
              }
            })
          );
        }

        return carUpdate;
      });

      return res.status(200).json({
        status: true,
        message: "SUCCESS_UPDATE_CAR",
        data: updateCar,
      });
    } catch (error) {
      console.error(error);

      if (req.file) {
        const path = req.file.path;
        fs.unlinkSync(path);
      }

      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  deleteCar: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const { id } = req.params;

      const car = await prisma.cars.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!car) {
        throw {
          statusCode: 404,
          message: "CAR_NOT_FOUND",
        };
      }

      if (car.image) {
        const path = car.image;
        // Check if file exists
        const exists = fs.existsSync(path);
        if (exists) {
          fs.unlinkSync(path);
        }
      }

      await prisma.cars.delete({
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({
        status: true,
        message: "SUCCESS_DELETE_CAR",
      });
    } catch (error) {
      console.error(error);

      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  deleteImageCar: async (req, res) => {
    const { id, image_id } = req.params;

    try {
      const car = await prisma.cars.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (!car) {
        throw {
          statusCode: 404,
          message: "CAR_NOT_FOUND",
        };
      }

      const image = await prisma.car_images.findUnique({
        where: {
          id: Number(image_id),
        },
      });
      if (!image) {
        throw {
          statusCode: 404,
          message: "IMAGE_NOT_FOUND",
        };
      }

      const path = image.image;
      const exists = fs.existsSync(path);
      if (exists) {
        fs.unlinkSync(path);
      }

      await prisma.car_images.delete({
        where: {
          id: Number(image_id),
        },
      });

      return res.status(200).json({
        status: true,
        message: "SUCCESS_DELETE_IMAGE_CAR",
      });
    } catch (error) {
      console.error(error);

      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
};
