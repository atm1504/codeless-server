exports.get404 = (req, res, next) => {
  res.status(404).json({message:"Failed to load, Not found"})
};

exports.get500 = (req, res, next) => {
  res.status(500).json({message:"Failed to load, Not found"})
};
