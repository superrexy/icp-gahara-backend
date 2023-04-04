const { PrismaClient } = require("@prisma/client");
const { countTotalDay } = require("../../helpers/strings.helpers");
const midtransPayment = require("../../helpers/payment.helpers");
const midtransClient = require("midtrans-client");
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
            car: {
              include: {
                car_images: true,
              },
            },
            rent_hour: {},
          },
          orderBy: {
            created_at: "desc",
          },
        });

        orders.forEach((order) => {
          order.car.image = order.car.car_images[0].image;
        });

        return res.status(200).json({
          status: true,
          message: "GET_ORDERS",
          data: orders,
        });
      }

      const orders = await prisma.orders.findMany({
        include: {
          car: {
            include: {
              car_images: true,
            },
          },
          rent_hour: {},
        },
      });

      orders.forEach((order) => {
        order.car.image = order.car.car_images[0].image;
      });

      return res.status(200).json({
        status: true,
        message: "GET_ORDERS",
        data: orders,
      });
    } catch (error) {
      console.error(error);
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
            car: {
              include: {
                car_images: {},
              },
            },
            rent_hour: {},
          },
        });

        if (!orders) {
          throw {
            statusCode: 404,
            message: "ORDER_NOT_FOUND",
          };
        }

        orders.car.image = orders.car.car_images[0].image;

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
        include: {
          car: {
            include: {
              car_images: {},
            },
          },
          rent_hour: {},
        },
      });

      if (!orders) {
        throw {
          statusCode: 404,
          message: "ORDER_NOT_FOUND",
        };
      }

      orders.car.image = orders.car.car_images[0].image;

      return res.status(200).json({
        status: true,
        message: "GET_ORDER",
        data: orders,
      });
    } catch (error) {
      console.error(error);
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
        rent_type,
        rent_hour_id,
        payment_type,
      } = req.body;

      const user_id = req.user.id;

      const car = await prisma.cars.findFirst({
        where: { id: Number(car_id) },
        include: {
          car_day_price: true,
          car_hour_price: true,
        },
      });
      if (!car) {
        throw {
          statusCode: 404,
          message: "CAR_NOT_FOUND",
        };
      }

      const ALLOW_RENT_TYPE = ["hour", "day"];

      const ALLOW_PAYMENT_TYPE = [
        "gopay",
        "shopeepay",
        "bri_va",
        "bca_va",
        "bni_va",
      ];

      if (!ALLOW_PAYMENT_TYPE.includes(payment_type)) {
        throw {
          statusCode: 400,
          message: "PAYMENT_TYPE_NOT_ALLOWED",
        };
      }

      if (!ALLOW_RENT_TYPE.includes(rent_type)) {
        throw {
          statusCode: 400,
          message: "RENT_TYPE_NOT_ALLOWED",
        };
      }

      let totalPrice = 0;

      if (rent_type === "day") {
        const totalDay = countTotalDay(
          new Date(start_date),
          new Date(end_date)
        );

        totalPrice = totalDay * car.car_day_price.price;
      } else if (rent_type === "hour") {
        const rentHour = await prisma.car_hour_price.findFirst({
          where: { id: Number(rent_hour_id) },
        });

        if (!rentHour) {
          throw {
            statusCode: 404,
            message: "RENT_HOUR_NOT_FOUND",
          };
        }

        totalPrice = rentHour.price;
      }

      const order = await prisma.$transaction(
        async (tx) => {
          const order = await tx.orders.create({
            data: {
              name_rent,
              no_ktp,
              address,
              phone,
              rental_purposes,
              rent_type: rent_type.toUpperCase(),
              rent_hour_id: rent_type === "hour" ? Number(rent_hour_id) : null,
              start_date: rent_type === "day" ? new Date(start_date) : null,
              end_date: rent_type === "day" ? new Date(end_date) : null,
              total_price: Number(totalPrice),
              car_id: Number(car_id),
              user_id: Number(user_id),
            },
          });

          const parameters = {
            payment_type: payment_type,
            customer_details: {
              first_name: order.name_rent,
              phone: order.phone,
            },
            transaction_details: {
              order_id: order.id,
              gross_amount: order.total_price,
            },
          };

          const midtrans = await midtransPayment(parameters);

          const expired = midtrans.expiry_time.split(" ");
          const expiredAt = `${expired[0]}T${expired[1]}.000+07:00`;

          await tx.payment.create({
            data: {
              order_id: order.id,
              bank: midtrans.bank || null,
              action_url: midtrans.action_url || null,
              va_number: midtrans.va_number || null,
              expired_at: new Date(expiredAt),
            },
          });

          return {
            ...order,
            midtrans,
          };
        },
        {
          timeout: 10000,
        }
      );

      return res.status(201).json({
        status: true,
        message: "SUCCESS_CREATE_ORDER",
        data: order,
      });
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  getOrderPayment: async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role !== "admin") {
        const order = await prisma.payment.findFirst({
          where: {
            order: {
              AND: [
                {
                  id: Number(id),
                  user_id: req.user.id,
                },
              ],
            },
          },
        });

        if (!order) {
          throw {
            statusCode: 404,
            message: "ORDER_NOT_FOUND",
          };
        }

        return res.status(200).json({
          status: true,
          message: "SUCCESS_GET_ORDER_PAYMENT",
          data: order,
        });
      }

      const order = await prisma.payment.findFirst({
        where: {
          order_id: Number(id),
        },
      });

      if (!order) {
        throw {
          statusCode: 404,
          message: "ORDER_NOT_FOUND",
        };
      }

      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_ORDER_PAYMENT",
        data: order,
      });
    } catch (error) {
      console.error(error);
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  midtransNotification: async (req, res) => {
    const apiClient = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    apiClient.transaction
      .notification(req.body)
      .then(async (statusResponse) => {
        const transactionId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;

        const orderId = transactionId.split("-")[1];

        if (transactionStatus === "settlement") {
          // Join Room
          req.io.to(`order-${orderId}`).emit("status", {
            status: "PAID",
          });

          await prisma.orders.update({
            where: {
              id: Number(orderId),
            },
            data: {
              status: "ACTIVE",
            },
          });
        } else if (transactionStatus === "expire") {
          req.io.to(`order-${orderId}`).emit(`status`, {
            status: "EXPIRED",
          });

          await prisma.orders.update({
            where: {
              id: Number(orderId),
            },
            data: {
              status: "EXPIRED",
            },
          });
        } else {
          req.io.to(`order-${orderId}`).emit(`status`, {
            status: "NOTPAID",
          });

          await prisma.orders.update({
            where: {
              id: Number(orderId),
            },
            data: {
              status: "NOTPAID",
            },
          });
        }

        res.status(200).json({
          status: true,
          message: "SUCCESS",
        });
      })
      .catch((error) => {
        return res.status(error.statusCode || 500).json({
          status: false,
          message: error.message || "Internal Server Error",
        });
      });
  },
};
