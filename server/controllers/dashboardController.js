import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Billing from "../models/Billing.js";
import Laboratory from "../models/Laboratory.js";
import Pharmacy from "../models/Pharmacy.js";
import Service from "../models/Service.js";
import Department from "../models/Department.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      patients,
      doctors,
      appointments,
      laboratories,
      services,
      departments,
      pharmacies,
      revenueAgg,
      appointmentStatus,
      recentAppointments,
      lowStockMeds,
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      Appointment.countDocuments({ isActive: true }),
      Laboratory.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Department.countDocuments({ isActive: true }),
      Pharmacy.countDocuments({ isActive: true, quantity: { $gt: 0 } }),
      Billing.aggregate([
        {
          $match: {
            isActive: true,
            paymentStatus: { $in: ["paid", "partial"] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalBills: { $sum: 1 },
          },
        },
      ]),
      Appointment.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Appointment.find({ isActive: true })
        .populate("patientId", "name")
        .populate("doctorId", "name specialization")
        .sort({ createdAt: -1 })
        .limit(10),
      Pharmacy.find({ isActive: true, quantity: { $lt: 20 } }).limit(5),
    ]);

    return res.json({
      totals: {
        patients,
        doctors,
        appointments,
        laboratories,
        services,
        departments,
        pharmacies,
        revenue: revenueAgg[0]?.totalRevenue || 0,
        bills: revenueAgg[0]?.totalBills || 0,
      },
      appointmentsByStatus: appointmentStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivity: recentAppointments,
      lowStockMedicines: lowStockMeds,
    });
  } catch (error) {
    return next(error);
  }
};
