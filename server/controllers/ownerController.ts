import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { v2 as cloudinary } from 'cloudinary'
import upload from "../config/multer.js";

//Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer: Buffer): Promise<{ secure_url: string }> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "QuickDine" }, (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("Upload failed"));
            resolve({ secure_url: result.secure_url })
        })
        stream.end(fileBuffer)
    })
}


//Get owner's restaurant
//GET /api/owner/restaurant
export const getOwnerRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user?._id })
        if (!restaurant) {
            res.status(200).json(null);
            return;
        }
        res.json(restaurant);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

//create owner's restaurant(submitted to pending)
//POST /api/owner/restaurant
export const createOwnerRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const existing = await Restaurant.findOne({ owner: req.user?._id })
        if (existing) {
            res.status(400).json({ message: "You already have a restaurant registered" });
            return;
        }

        const { name, description, cuisine, priceRange, location, address, chef, tags, availableSlots, totalSeats } = req.body;
        if (!name || !description || !cuisine || !priceRange || !location || !address || !chef) {
            res.status(400).json({ message: "Please provide all required fields" })
            return;
        }

        //Generate slug from name
        const slug = name.toLowerCase().repalce(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        const slugExists = await Restaurant.findOne({ slug });
        if (slugExists) {
            res.status(400).json({ message: "A restaurant with this name already exists" });
            return;
        }

        //Handle image
        let imageUrl = "";
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer)
            imageUrl = result.secure_url;
        }

        //setup parsed tags and slots
        const parsedTags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) :
            tags || [];
        const parsedSlots = typeof availableSlots === "string" ? availableSlots.split(",").map((s) => s.trim()) : availableSlots || ["17:00", "18:00", "19:00", "20:00", "21:00"];

        const restaurant = await Restaurant.create({
            name,
            slug,
            description,
            cuisine,
            location,
            priceRange,
            address,
            chef,
            image: imageUrl,
            tags: parsedTags,
            availableSlots: parsedSlots,
            totalSeats: totalSeats ? Number(totalSeats) : 20,
            owner: req.user?._id,
            status: "pending"
        })

        res.status(201).json(restaurant);

    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

//Update owner's restaurant
//PUT /api/owner/restaurant
export const updateOwnerRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user?._id })
        if (!restaurant) {
            res.status(404).json({ message: "Restaurant profile not found" });
            return;
        }

        const { name, description, cuisine, priceRange, location, address, chef, tags, availableSlots, totalSeats } = req.body;

        if (name) restaurant.name = name;
        if (description) restaurant.description = description;



    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

//get bookings for owner's restaurant
//GET /api/owner/restaurant
export const getOwnerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {

    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

//Update status of booking
//PUT /api/owner/bookings/:id/status
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {

    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}