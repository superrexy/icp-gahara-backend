const { PrismaClient } = require("@prisma/client");
const { countTotalDay } = require("../../helpers/strings.helpers");
const prisma = new PrismaClient();

module.exports = {
  getOrders: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const user_id = req.user.id;

      if (req.user.role !== "admin") {
        const orders = await prisma.orders.findMany({
          where: {
            user_id,
          },
          include: {
            car: {},
          },
        });

        return res.status(200).json({
          status: true,
          message: "GET_ORDERS",
          data: orders,
        });
      }

      const orders = await prisma.orders.findMany({ include: { car: {} } });

      return res.status(200).json({
        status: true,
        message: "GET_ORDERS",
        data: orders,
      });
    } catch (error) {
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  getOrder: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      if (req.user.role !== "admin") {
        const orders = await prisma.orders.findFirst({
          where: {
            AND: {
              id: Number(id),
              user_id,
            },
          },
          include: {
            car: {},
          },
        });

        if (!orders) {
          throw {
            statusCode: 404,
            message: "ORDER_NOT_FOUND",
          };
        }

        return res.status(200).json({
          status: true,
          message: "GET_ORDERS",
          data: orders,
        });
      }

      const orders = await prisma.orders.findFirst({
        where: {
          id: Number(id),
        },
        include: { car: {} },
      });

      if (!orders) {
        throw {
          statusCode: 404,
          message: "ORDER_NOT_FOUND",
        };
      }

      return res.status(200).json({
        status: true,
        message: "GET_ORDER",
        data: orders,
      });
    } catch (error) {
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  createOrder: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const {
        name_rent,
        no_ktp,
        address,
        phone,
        rental_purposes,
        start_date,
        end_date,
        car_id,
      } = req.body;

      const user_id = req.user.id;

      const car = await prisma.cars.findUnique({
        where: { id: Number(car_id) },
      });
      if (!car) {
        throw {
          statusCode: 404,
          message: "CAR_NOT_FOUND",
        };
      }

      const totalDay = countTotalDay(new Date(start_date), new Date(end_date));
      const totalPrice = totalDay * car.price;

      const order = await prisma.orders.create({
        data: {
          name_rent,
          no_ktp,
          address,
          phone,
          rental_purposes,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          total_price: Number(totalPrice),
          car_id: Number(car_id),
          user_id: Number(user_id),
        },
      });

      return res.status(201).json({
        status: true,
        message: "SUCCESS_CREATE_ORDER",
        data: order,
      });
    } catch (error) {
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  updateOrder: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const {
        name_rent,
        no_ktp,
        address,
        phone,
        rental_purposes,
        start_date,
        end_date,
        status,
        car_id,
      } = req.body;

      const { id } = req.params;

      const order = await prisma.orders.findFirst({
        where: {
          id: Number(id),
        },
        include: { car: {} },
      });

      if (!order) {
        throw {
          statusCode: 404,
          message: "ORDER_NOT_FOUND",
        };
      }

      const car = await prisma.cars.findUnique({
        where: { id: Number(car_id) },
      });
      if (!car) {
        throw {
          statusCode: 404,
          message: "CAR_NOT_FOUND",
        };
      }

      const updateOrder = await prisma.orders.update({
        where: {
          id: Number(id),
        },
        data: {
          name_rent,
          no_ktp,
          address,
          phone,
          rental_purposes,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          total_price: Number(),
          status,
          car_id,
        },
      });

      return res.status(200).json({
        status: true,
        message: "SUCCESS_UPDATE_ORDER",
        data: updateOrder,
      });
    } catch (error) {
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  deleteOrder: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const { id } = req.params;

      const order = await prisma.orders.findFirst({
        where: {
          id: Number(id),
        },
        include: { car: {} },
      });

      if (!order) {
        throw {
          statusCode: 404,
          message: "ORDER_NOT_FOUND",
        };
      }

      await prisma.orders.delete({
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({
        status: true,
        message: "SUCCESS_DELETE_ORDER",
      });
    } catch (error) {
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  doneOrder: async (req, res) => {
    try {
      const { id } = req.params;

      const order = await prisma.orders.findFirst({
        where: {
          id: Number(id),
        },
        include: { car: {} },
      });

      if (!order) {
        throw {
          statusCode: 404,
          message: "ORDER_NOT_FOUND",
        };
      }

      const updateOrder = await prisma.orders.update({
        where: {
          id: order.id,
        },
        data: {
          status: "INACTIVE",
        },
      });

      return res.status(200).json({
        status: true,
        message: "SUCCESS_DONE_ORDER",
        data: updateOrder,
      });
    } catch (error) {
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
};
