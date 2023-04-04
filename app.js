const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.join(room);
  });

  socket.on("leave", (room) => {
    socket.leave(room);
  });
});

const authRouter = require("./app/api/auth/auth.router");
const usersRouter = require("./app/api/users/users.router");
const locationsRouter = require("./app/api/locations/locations.router");
const carsRouter = require("./app/api/cars/cars.router");
const ordersRouter = require("./app/api/orders/orders.router");

const URL_PREFIX_API_V1 = "/api/v1";

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  req.io = io;
  next();
});

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Index Route
app.get("/", (req, res) => {
  return res.send("ICP Gahara Backend");
});

// API Routes
app.use(`${URL_PREFIX_API_V1}`, authRouter);
app.use(`${URL_PREFIX_API_V1}`, usersRouter);
app.use(`${URL_PREFIX_API_V1}`, locationsRouter);
app.use(`${URL_PREFIX_API_V1}`, carsRouter);
app.use(`${URL_PREFIX_API_V1}`, ordersRouter);

app.use((req, res, next) => {
  return res.status(404).json({
    status: false,
    message: "PAGE_NOT_FOUND",
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
