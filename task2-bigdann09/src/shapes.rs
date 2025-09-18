///-------------------------------------------------------------------------------
///
/// This is your first task to get warmed up and see how useful traits can be.
///
/// Complete the implementation of methods in the Rectangle and Circle structs,
/// then implement the Shape trait for both structs.
///
/// Tasks:
/// 1. Implement Rectangle struct methods (constructor, setters, getters)
/// 2. Implement Circle struct methods (constructor, setter, getter)
/// 3. Implement the Shape trait for both Rectangle and Circle
/// 4. Handle validation errors properly using the Error enum
///
///-------------------------------------------------------------------------------

pub trait Shape {
    fn area(&self) -> f64;
    fn perimeter(&self) -> f64;
}

pub struct Rectangle {
    width: f64,
    height: f64,
}

pub struct Circle {
    radius: f64,
}

#[derive(Debug, PartialEq)]
pub enum Error {
    InvalidWidth,
    InvalidHeight,
    InvalidRadius,
}

// TODO: Implement constructor with setters and getters.
//
// Width and height are considered invalid if they are negative.
// All methods should return the corresponding error when invalid values are provided.
impl Rectangle {
    pub fn new(width: f64, height: f64) -> Result<Self, Error> {
        // check if width and height are valid
        if width < 0.0 {
            return Err(Error::InvalidWidth);
        }

        // check if height is valid
        if height < 0.0 {
            return Err(Error::InvalidHeight);
        }

        // assign the new width and height to the Rectangle struct
        Ok(Rectangle { width, height })
    }
    pub fn set_width(&mut self, width: f64) -> Result<(), Error> {
        // check if width is valid
        if width < 0.0 {
            return Err(Error::InvalidWidth);
        }

        // assign the new width
        self.width = width;
        Ok(())
    }
    pub fn set_height(&mut self, height: f64) -> Result<(), Error> {
        // check if height is valid
        if height < 0.0 {
            return Err(Error::InvalidHeight);
        }

        // assign the new height
        self.height = height;
        Ok(())
    }
    pub fn get_width(&self) -> f64 {
        // return the width
        self.width
    }
    pub fn get_height(&self) -> f64 {
        // return the height
        self.height
    }
}

// TODO: Implement constructor with setter and getter.
//
// The radius is considered invalid if it is negative.
// All methods should return the corresponding error when invalid values are provided.
impl Circle {
    pub fn new(radius: f64) -> Result<Self, Error> {
        // check if radius is valid
        if radius < 0.0 {
            return Err(Error::InvalidRadius);
        }

        // assign the new radius to the Circle struct
        Ok(Circle { radius })
    }
    pub fn set_radius(&mut self, radius: f64) -> Result<(), Error> {
        // check if radius is valid
        if radius < 0.0 {
            return Err(Error::InvalidRadius);
        }

        // assign the new radius
        self.radius = radius;
        Ok(())
    }
    pub fn get_radius(&self) -> f64 {
        // return the radius value
        self.radius
    }
}

// TODO: Implement the Shape trait for both Rectangle and Circle structs.
impl Shape for Rectangle {
    fn area(&self) -> f64 {
        // calculate the area of the rectangle
        self.width * self.height
    }

    fn perimeter(&self) -> f64 {
        // calculate the perimeter of the rectangle
        2.0 * (self.width + self.height)
    }
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        // calculate the area of the circle
        std::f64::consts::PI * self.radius * self.radius
    }
    fn perimeter(&self) -> f64 {
        // calculate the circumference of the circle
        2.0 * std::f64::consts::PI * self.radius
    }
}
// Hint: Use std::f64::consts::PI to calculate the area and circumference of the circle.
