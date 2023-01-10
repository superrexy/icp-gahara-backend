const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const prisma = new PrismaClient();

module.exports = {
  getCars: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const cars = await prisma.cars.findMany({});
      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_CARS",
        data: cars,
      });
    } catch (error) {
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
      });

      if (!car) {
        throw {
          statusCode: 404,
          message: "CAR_NOT_FOUND",
        };
      }

      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_CAR",
        data: car,
      });
    } catch (error) {
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
        price,
        seats,
        type_fuel,
        transmision,
      } = req.body;

      if (!req.file) {
        throw {
          statusCode: 400,
          message: "IMAGE_REQUIRED",
        };
      }

      const car = await prisma.cars.create({
        data: {
          name,
          description,
          price: Number(price),
          seats: Number(seats),
          type_fuel,
          type_car,
          transmision,
          image: req.file.path,
        },
      });

      return res.status(201).json({
        status: true,
        message: "SUCCESS_CREATE_CAR",
        data: car,
      });
    } catch (error) {
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
        price,
        seats,
        type_car,
        type_fuel,
        transmision,
      } = req.body;

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

      if (req.file) {
        if (car.image) {
          const path = car.image;
          fs.unlinkSync(path);
        }
      }

      const updateCar = await prisma.cars.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          description,
          price: Number(price),
          seats: Number(seats),
          type_fuel,
          type_car,
          transmision,
          image: req.file ? req.file.path : car.image,
        },
      });

      return res.status(200).json({
        status: true,
        message: "SUCCESS_UPDATE_CAR",
        data: updateCar,
      });
    } catch (error) {
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
        fs.unlinkSync(path);
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
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
};
