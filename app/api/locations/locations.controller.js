const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  getLocation: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const location = await prisma.location.findFirst();

      return res.status(200).json({
        status: true,
        message: "GET_LOCATION",
        data: location,
      });
    } catch (error) {
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  updateLocation: async (req, res) => {
    /* #swagger.security = [{
               "Bearer": []
        }] */
    try {
      const { address, latitude, longitude } = req.body;

      const location = await prisma.location.findFirst();

      const updateLocation = await prisma.location.update({
        where: {
          id: location.id,
        },
        data: {
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      });

      return res.status(200).json({
        status: true,
        message: "LOCATION_UPDATED",
        data: updateLocation,
      });
    } catch (error) {
      return res.status(500 || error.statusCode).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
};
