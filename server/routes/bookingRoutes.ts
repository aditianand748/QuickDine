import { Router } from "express";
import { cancelBooking, createBooking, getMyBookings } from "../controllers/bookingController.js";
import { protect } from "../middlewares/auth.js";

const bookingRouter = Router();

bookingRouter.post("/", protect, createBooking)
bookingRouter.get("/my", protect, getMyBookings)
bookingRouter.put("/:id/cancel", protect, cancelBooking)

export default bookingRouter;