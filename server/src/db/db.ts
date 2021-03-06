import path from 'path';
interface Coord {
  lat: Number;
  long: Number;
}

require('dotenv').config({ path: path.resolve(process.cwd(), '../.env') });

const { DB_HOST, DB_USER, DB_PORT, DB_PASSWORD, DB_NAME } = process.env;

const { Sequelize, DataTypes, Op } = require('sequelize');

// Create connection to postgres
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
});

// Define device table
const Device = sequelize.define(
  'device',
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    microchip: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

// Define coordinate table
const Coordinate = sequelize.define(
  'coordinate',
  {
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
  }
);
Coordinate.belongsTo(Device);

// Define perimeter table
const Perimeter = sequelize.define(
  'perimeter',
  {
    p1lat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    p1long: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    p2lat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    p2long: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
Perimeter.belongsTo(Device);

// Define trip table
const Trip = sequelize.define(
  'trip',
  {
    name: {
      type: DataTypes.STRING,
    },
    start: {
      type: DataTypes.DATE,
    },
    end: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
  }
);
Trip.belongsTo(Device);

const User = sequelize.define(
  'admin',
  {
    name: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

// Reset functions

const resetDB = () => {
  return sequelize.sync({ force: true });
};
exports.resetDB = resetDB;

const seedDB = () => {
  return resetDB().then(() => {
    return Device.create({
      id: 1,
      name: 'admin',
      microchip: 'test',
    }).then(() => {
      User.create({
        name: 'Paw Patrol',
        phone: '0118 999 881 999 119 725 3',
        email: 'pawspatrol2022@gmail.com',
        password: 'clubmed7',
      });
      Coordinate.create({
        latitude: 42.774749900216115,
        longitude: -81.5088462007877,
        time: 1,
        deviceId: 1,
      });
      Perimeter.create({
        deviceId: 1,
        p1lat: 43.576052,
        p1long: -80.2646819,
        p2lat: 43.575428,
        p2long: -80.264532,
      });
    });
  });
};
exports.seedDB = seedDB;

// Coordinate functions

const addCoordinate = (imei: number, lat: number, long: number, time: Date) => {
  return Coordinate.create({
    deviceId: imei,
    latitude: lat,
    longitude: long,
    time: time,
  });
};
exports.addCoordinate = addCoordinate;

const getCoordinate = (imei: number) => {
  return Coordinate.findOne({
    order: [['id', 'DESC']],
    where: { deviceId: imei },
  });
};
exports.getCoordinate = getCoordinate;

// Device functions

const addDevice = (imei: number, name: string = '', microchip: string = '') => {
  return Device.create({
    id: imei,
    name: name,
    microchip: microchip,
  });
};
exports.addDevice = addDevice;

const getDevice = (imei: number) => {
  return Device.findByPk(imei);
};
exports.getDevice = getDevice;

const updateDevice = (imei: number, name: string, microchip: string) => {
  return getDevice(imei).then((data: any) => {
    if (!data) {
      console.log('no data');
      return;
    }
    return data.update({
      name: name,
      microchip: microchip,
    });
  });
};
exports.updateDevice = updateDevice;

const deleteDevice = (id: number) => {
  return Device.destroy({
    where: {
      id: id,
    },
  });
};

exports.deleteDevice = deleteDevice;

const getDevices = () => {
  return Device.findAll();
};
exports.getDevices = getDevices;

// Trip functions

const addTrip = (imei: number, start: Date, name: string = '') => {
  return Trip.create({
    deviceId: imei,
    name: name,
    start: start,
    end: start,
  });
};
exports.addTrip = addTrip;

const getTripsByIMEI = (imei: number) => {
  return Trip.findAll({
    where: {
      deviceId: imei,
    },
  });
};
exports.getTripsByIMEI = getTripsByIMEI;

const updateTrip = (id: number, end: Date) => {
  return Trip.findByPk(id).then((data: any) => {
    return data.update({ end: end });
  });
};
exports.updateTrip = updateTrip;

const getTrips = () => {
  return Trip.findAll();
};
exports.getTrips = getTrips;

const getCoordinatesForTrip = (id: number, imei: number) => {
  return Trip.findByPk(id).then((data: any) => {
    return Coordinate.findAll({
      where: {
        deviceId: imei,
        time: {
          [Op.between]: [data.start, data.end],
        },
      },
    });
  });
};
exports.getCoordinatesForTrip = getCoordinatesForTrip;

// Perimeter functions

const addPerimeter = (imei: number, p1: Coord, p2: Coord) => {
  return Perimeter.create({
    deviceId: imei,
    p1lat: p1.lat,
    p1long: p1.long,
    p2lat: p2.lat,
    p2long: p2.long,
  });
};
exports.addPerimeter = addPerimeter;

const getPerimeterByIMEI = (imei: number) => {
  return Perimeter.findOne({
    order: [['updatedAt', 'DESC']],
    where: { deviceId: imei },
  });
};
exports.getPerimeterByIMEI = getPerimeterByIMEI;

const updatePerimeter = (imei: number, p1: Coord, p2: Coord) => {
  return getPerimeterByIMEI(imei).then((data: any) => {
    return data.update({
      deviceId: imei,
      p1lat: p1.lat,
      p1long: p1.long,
      p2lat: p2.lat,
      p2long: p2.long,
    });
  });
};
exports.updatePerimeter = updatePerimeter;

const deletePerimeter = (id: number) => {
  return Perimeter.destroy({
    where: {
      id: id,
    },
  });
};

exports.deletePerimeter = deletePerimeter;

const getPerimeters = () => {
  return Perimeter.findAll();
};
exports.getPerimeters = getPerimeters;

// User functions

const getUser = () => {
  return User.findOne();
};
exports.getUser = getUser;

const updateUser = (name: string, phone: string, email: string, password: string) => {
  return getUser().then((data: any) => {
    return data.update({
      name: name,
      phone: phone,
      email: email,
      password: password,
    });
  });
};
exports.updateUser = updateUser;
