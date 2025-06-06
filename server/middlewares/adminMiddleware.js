const admin = async (req, res, next) => {
  try {
    if (req.user.email === process.env.ADMIN_EMAIL) {
      next();
    } else {
      res.status(401).json({ message: 'Not authorized as an admin' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

export default admin; 