const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const doctorPatientRoutes = require('./routes/doctorPatientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const metaRoutes = require('./routes/metaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const {
  sanitizeRequest,
  apiLimiter,
} = require('./middleware/securityMiddleware');

dotenv.config();

connectDB();

const app = express();

app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://e-recete-front.vercel.app',
  'https://e-recete-front-b015np8ei-kamil-ertaps-projects.vercel.app',
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(apiLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(sanitizeRequest);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to E-Recete API',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/connections', doctorPatientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});