/*
MySQL Connection 

Sequence of function -

1. LoginPage
2. SignupPage
3. Add InstructorInfo
4. Display InstructorInfo (InstructorDashboard)
5. Display Courses 
6. Add a new course 
7. Display UserInfo (UserDashboard)
8. Add course to userDashbaord

*/
//&"C:\Program Files\MySQL\MySQL Server 8.0\bin\MySQL.exe" -u root -p


const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');


const app = express();

app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use("/css", express.static(path.join(__dirname, "public", "css")));
app.use("/images", express.static(path.join(__dirname, "public", "images")));

//----------------------- Create MySQL connection-----------------------------------
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "vedu11",
    database: "eduquest",
});
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database');
});
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, () => {
    console.log("Listening on ....");
});

//-------------------------------------------Route for login page---------------------------------------------------------
app.get("/about.html", function(req, res) {
    res.sendFile(path.join(__dirname,  'public', 'html', 'about.html'));
});
app.get("/courses.html", function(req, res) {
    res.sendFile(path.join(__dirname,  'public', 'html', 'courses.html'));
});

app.get("/contact.html", function(req, res) {
    res.sendFile(path.join(__dirname,  'public', 'html', 'contact.html'));
});

app.post("/contact", function(req, res) {
    let { username, password, user_type } = req.body;
    user_type = 'user';
  
    let q, table;
    if (user_type === 'instructor') {
      q = "SELECT * FROM instructor WHERE email=? AND password=?";
      table = "instructor";
    } else {
      q = "SELECT * FROM user WHERE email=? AND password=?";
      table = "user";
    }
  
    let data = [username, password];
    db.query(q, data, (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).send("Internal Server Error");
        return;
      }
  
      if (result.length > 0) {
        console.log(`${table} found:`, result);
        res.redirect("/index.html");
      } else {
        res.status(401).send("Invalid username or password");
      }
    });
  });

  app.get("/index.html", function(req, res) {
    res.sendFile(path.join(__dirname,  'public', 'html', 'index.html'));
});
//--------------------------------------------Route for Signup Page----------------------------------------------------
app.get("/signup.html", function(req, res){
    res.sendFile(path.join(__dirname, "public" ,"html", "signup.html"));
});

app.post("/signup", function(req, res) {
    let { name, email, password, userType } = req.body;
    let tableName = (userType === "user") ? "user" : "instructor";

    let q = `INSERT INTO ${tableName} (name, email, password) VALUES (?, ?, ?)`;
    let data = [name, email, password];

    db.query(q, data, (error, result) => {
        if (error) {
            console.error('Error inserting user data:', error);
            res.status(500).send("Internal Server Error");
            return;
        } else {
            let redirectUrl = (userType === "user") ? "/userpage.html" : "/instructorpage.html";
            res.redirect(redirectUrl);
            console.log("Successfully signed up!");
        }
    });
});
app.get("/userpagehtml", function(req, res){
    res.sendFile(path.join(__dirname, "public","html", "userpage.html"));
});
app.get("/instructorpage.html", function(req, res){
    res.sendFile(path.join(__dirname, "public","html", "instructorpage.html"));
});

//------------------------------------Route to handle submitting instructor information-----------------------------
app.post("/instructorpage", (req, res) => {
    console.log("Request Body:", req.body);
    let { qualification, expertise, workExperience, majorSubjects, minorSubjects} = req.body;
    let q = "INSERT INTO instructor_info ( qualification, expertise, work_experience, major_subjects, minor_subjects) VALUES ( ?, ?, ?, ?, ?)";
    let data = [ qualification, expertise, workExperience, majorSubjects, minorSubjects];
  
    db.query(q, data, (error, result) => {
        if (error) {
            console.error('Error inserting instructor info:', error.stack);
            res.status(500).send("Internal Server Error");
            return;
        }
        console.log("Instructor info inserted successfully");
        res.redirect("/instructordashboard");
    });
});

//-------------------------------Route for Instructor Dashboard-------------------------------
app.get("/instructordashboard", function(req, res) {
    let q = "SELECT * FROM instructor_info ";
    db.query(q, (error, result) => {
        if (error) {
            console.error('Error fetching instructor data:', error);
            res.status(500).send("Internal Server Error");
            return;
        }
        console.log("Instructor data fetched successfully:", result);
        res.render("instructordashboard", { instructors: result });
    });
});


//---------------------------------------Route for course--------------------------------------------

app.get("/courses", function(req, res){
    let q="SELECT * FROM course";
    db.query(q, (error, result) => {
        if (error) {
            console.error('Error fetching course data:', error);
            res.status(500).send("Internal Server Error");
            return;
        }
        console.log("Course data fetched successfully:", result);
        res.render("courses", { courses: result });
    });

});

//-------------------------------------Route to add course ----------------------------------

app.post("/add_course", function(req, res){
    let {coursename , descriptiom , instructor , duration} = req.body;
    let q="INSERT INTO course (coursename , description  ,instructor ,duration) values (?, ? ,?, ?)";
    let data=[coursename , descriptiom , instructor , duration];

    db.query(q, data, (error, result) => {
        if (error) {
            console.error('Error inserting instructor info:', error.stack);
            res.status(500).send("Internal Server Error");
            return;
        }
        console.log("Instructor info inserted successfully");
        res.redirect("/courses");
    });


})

//----------------------------------Route for userDashboard---------------------------------------

app.get("/userdashboard", function(req, res){
    let q="SELECT * FROM user";
    db.query(q, (error, result) => {
        if (error) {
            console.error('Error fetching course data:', error);
            res.status(500).send("Internal Server Error");
            return;
        }
        console.log("Course data fetched successfully:", result);
        res.render("userdashboard", { users: result });
    });
})

//-------------------------------Add Course to UserDashboard---------------------------------------