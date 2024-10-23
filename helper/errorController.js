//handle email or username duplicates
const handleDuplicateKeyError = (err, res) => {
    const field = Object.keys(err.keyValue);
    const status = 409;
    const error = `${field} already exist.`;

    let myarr = {};
    myarr[field] = error;

    res.status(status).send({ isSuccess: false, status, message: myarr }); //fields: field
  };
  
  //handle field formatting, empty fields, and mismatched passwords
  const handleValidationError = (err, res) => {
    // let errors = Object.values(err.errors).map((el) => el.message);

   let myarr = {};
    Object.keys(err.errors).forEach((key) => {
        myarr[key] = err.errors[key].message; 
    });
      // console.log(myarr);
    //   let fields = Object.values(err.errors).map((el) => el.path);
    const status = 400;
    if (myarr) {
      // const formattedErrors = errors.join(" ");
      res.status(status).send({ isSuccess: false, status, message:myarr }); //fields: fields
    } else {
      res.status(status).send({ isSuccess: false, status, message:myarr }); // fields: fields
    }
  };
  
  // handle multer related errors
  const handleMulterError = (err, res) => {
    console.log(err, "Error in files")
    if (err.status === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .json({ isSuccess: false, status: 400, message: "Too many files,You can only select Three files." });//err.message
    } else if (err.status === 'LIMIT_FILE_SIZE' || err.message === "File too large") {
      return res
        .status(400)
        .json({ isSuccess: false, status: 400, message: "File is too large." }); //err.message
    }
    else {
      return res.status(400).json({ isSuccess: false, status: 400, message: "Something wrong in file uploading." })
    }
  }
  
  // handle file type related errors 
  const handleMulterFileTypeError = (err, res) => {
    return res.status(400).json({ isSuccess: false, status: 400, message: "File type is not supported.", Note: "Support type is :JPEG,PNG,JPG" })
  }
  
  //error controller function
  module.exports = (err, req, res, next) => {
    // console.log(err, "Error in some ware")
    try {
      if (err.name === "MulterError") {
        return (err = handleMulterError(err, res));
      }
      if (err.message == "Invalid file type.") {
        return (err = handleMulterFileTypeError(err, res))
      }
      if (err.name === "ValidationError") {
        return (err = handleValidationError(err, res));
      }
      if (err.code && err.code == 11000) {
        return (err = handleDuplicateKeyError(err, res));
      }
      if (!res.headersSent) {
        next(err)
      }
      next();
    } catch (err) {
      res.status(500).json({ isSuccess: false, status: 500, message: "Internal server error." });
    }
  };