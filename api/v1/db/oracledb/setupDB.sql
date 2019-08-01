DROP TABLE PARKS;
DROP TABLE OWNERS;

CREATE TABLE PARKS (
	ID NUMBER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
	NAME VARCHAR2(225) NOT NULL,
	STREET_ADDRESS VARCHAR2(225) NOT NULL,
	CITY VARCHAR2(225) NOT NULL,
	STATE VARCHAR2(225) NOT NULL,
	ZIP INTEGER NOT NULL,
	LATITUDE FLOAT NOT NULL,
	LONGITUDE FLOAT NOT NULL,
	OWNER_ID VARCHAR2(225) NOT NULL,

	BALLFIELD BOOLEAN NOT NULL,
	BBQ BOOLEAN NOT NULL,
	BASKETBALL BOOLEAN NOT NULL,
	BIKE_PATHS BOOLEAN NOT NULL,
	BOAT_RAMPS BOOLEAN NOT NULL,
	DOGS_ALLOWED BOOLEAN NOT NULL,
	DRINKING_WATER BOOLEAN NOT NULL,
	FISHING BOOLEAN NOT NULL,
	HIKING BOOLEAN NOT NULL,
	HORSESHOES BOOLEAN NOT NULL,
	NATURAL_AREA BOOLEAN NOT NULL,
	DOG_PARK BOOLEAN NOT NULL,
	FIELDS BOOLEAN NOT NULL,
	SHELTERS BOOLEAN NOT NULL,
	TABLES BOOLEAN NOT NULL,
	PLAY_AREA BOOLEAN NOT NULL,
	RESTROOMS BOOLEAN NOT NULL,
	SCENIC_VIEW BOOLEAN NOT NULL,
	SOCCER BOOLEAN NOT NULL,
	TENNIS BOOLEAN NOT NULL,
	VOLLEYBALL BOOLEAN NOT NULL,

	PRIMARY KEY(ID)
);

COMMENT ON TABLE PARKS IS 'Contains data on parks';
COMMENT ON COLUMN PARKS.ID IS 'Unique ID of a park';
COMMENT ON COLUMN PARKS.STREET_ADDRESS IS 'Street address of a park';
COMMENT ON COLUMN PARKS.NAME IS 'Name of a park';
COMMENT ON COLUMN PARKS.CITY IS 'City a park is located in';
COMMENT ON COLUMN PARKS.STATE IS 'State a park is located in';
COMMENT ON COLUMN PARKS.ZIP IS 'Zip code of a park';
COMMENT ON COLUMN PARKS.LATITUDE IS 'Latitude of a park';
COMMENT ON COLUMN PARKS.LONGITUDE IS 'Longitude of a park';
COMMENT ON COLUMN PARKS.OWNER_ID IS 'Id of a park owner'

INSERT INTO PARKS (NAME, STREET_ADDRESS, CITY, STATE, ZIP, LATITUDE, LONGITUDE,
	OWNER_ID, BALLFIELD, BBQ, BASKETBALL, BIKE_PATHS, BOAT_RAMPS, DOGS_ALLOWED,
	DRINKING_WATER, FISHING, HIKING, HORSESHOES, NATURAL_AREA, DOG_PARK,
	FIELDS, SHELTERS, TABLES, PLAY_AREA, RESTROOMS, SCENIC_VIEW, SOCCER,
	TENNIS, VOLLEYBALL) 
	VALUES ('Avery Park', '1200 SW Avery Park Dr.','Corvallis', 'OR', 97333,
	44.552283, -123.269906, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE,
	TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE,
	TRUE
);
INSERT INTO PARKS (NAME, STREET_ADDRESS, CITY, STATE, ZIP, LATITUDE, LONGITUDE) 
VALUES ('Bald Hill Natural Area', '6460 NW Oak Creek Dr.', 'Corvallis', 'OR', 
	97330, 44.575721, -123.325302
);

CREATE TABLE OWNERS (
	ID NUMBER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
	NAME VARCHAR2(225) NOT NULL,
	PRIMARY KEY(ID)
);

COMMENT ON TABLE PARKS IS 'Contains data on park owners';
COMMENT ON COLUMN OWNERS.ID IS 'Unique ID of a park owner';
COMMENT ON COLUMN OWNERS.NAME IS 'Name of a park owner';

INSERT INTO OWNERS (NAME) VALUES ('City of Corvallis');
