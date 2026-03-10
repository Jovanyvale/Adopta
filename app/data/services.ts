import { Service } from "../types/services"

export const services: Service[] = [
    {
        title: "Vaccination",
        description: "Administration of core and optional vaccines according to your pet’s age, lifestyle, and medical history to prevent diseases.",
        image: "vaccination.jpg",
        url: "/",
        buttonText: "More info"
    },
    {
        title: "Diagnostic",
        description: "Comprehensive diagnostic services such as physical examinations, laboratory tests, and imaging to accurately detect health conditions.",
        image: "diagnostic.jpg",
        url: "/",
        buttonText: "More info"
    },
    {
        title: "Micro Chip",
        description: "A microchip is a small electronic device implanted under your pet’s skin that stores a unique identification number. If your pet gets lost, veterinarians and shelters can scan the chip and quickly access your contact information, increasing the chances of a safe return. The procedure is fast, safe, and does not require surgery.",
        image: "micro-chip.jpg",
        url: "/",
        buttonText: "More info"
    },
    {
        title: "Sterilization",
        description: "Surgical sterilization procedures designed to prevent unwanted pregnancies and improve long-term health and behavior.",
        image: "sterilization.jpg",
        url: "/",
        buttonText: "More info"
    }
]