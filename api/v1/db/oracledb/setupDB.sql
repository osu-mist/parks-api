DROP TABLE PARKS;
DROP TABLE OWNERS;

CREATE TABLE OWNERS (
	ID NUMBER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
	NAME VARCHAR2(225) NOT NULL,
	PRIMARY KEY(ID)
);
COMMENT ON TABLE OWNERS IS 'Contains data on park owners';
COMMENT ON COLUMN OWNERS.ID IS 'Unique ID of a park owner';
COMMENT ON COLUMN OWNERS.NAME IS 'Name of a park owner';
INSERT INTO OWNERS (NAME) VALUES ('City of Corvallis');

CREATE TABLE PARKS (
	ID NUMBER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
	NAME VARCHAR2(225) NOT NULL,
	STREET_ADDRESS VARCHAR2(225) NOT NULL,
	CITY VARCHAR2(225) NOT NULL,
	STATE CHAR(2) NOT NULL,
	ZIP INTEGER NOT NULL,
	LATITUDE FLOAT NOT NULL,
	LONGITUDE FLOAT NOT NULL,
    OWNER_ID NUMBER NOT NULL,
    PRIMARY KEY(ID),
	FOREIGN KEY(OWNER_ID) REFERENCES OWNERS(ID),
	BALLFIELD NUMBER(1) NOT NULL,
	BBQ NUMBER(1) NOT NULL,
	BASKETBALL NUMBER(1) NOT NULL,
	BIKE_PATHS NUMBER(1) NOT NULL,
	BOAT_RAMPS NUMBER(1) NOT NULL,
	DOGS_ALLOWED NUMBER(1) NOT NULL,
	DRINKING_WATER NUMBER(1) NOT NULL,
	FISHING NUMBER(1) NOT NULL,
	HIKING NUMBER(1) NOT NULL,
	HORSESHOES NUMBER(1) NOT NULL,
	NATURAL_AREA NUMBER(1) NOT NULL,
	DOG_PARK NUMBER(1) NOT NULL,
	FIELDS NUMBER(1) NOT NULL,
	SHELTERS NUMBER(1) NOT NULL,
	TABLES NUMBER(1) NOT NULL,
	PLAY_AREA NUMBER(1) NOT NULL,
	RESTROOMS NUMBER(1) NOT NULL,
	SCENIC_VIEW NUMBER(1) NOT NULL,
	SOCCER NUMBER(1) NOT NULL,
	TENNIS NUMBER(1) NOT NULL,
	VOLLEYBALL NUMBER(1) NOT NULL
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
COMMENT ON COLUMN PARKS.OWNER_ID IS 'Id of a park owner';

INSERT INTO PARKS (NAME, STREET_ADDRESS, CITY, STATE, ZIP, LATITUDE, LONGITUDE, OWNER_ID,
    BALLFIELD, BBQ, BASKETBALL, BIKE_PATHS, BOAT_RAMPS, DOGS_ALLOWED,
	DRINKING_WATER, FISHING, HIKING, HORSESHOES, NATURAL_AREA, DOG_PARK,
	FIELDS, SHELTERS, TABLES, PLAY_AREA, RESTROOMS, SCENIC_VIEW, SOCCER,
	TENNIS, VOLLEYBALL) 
	VALUES ('Avery Park', '1200 SW Avery Park Dr.','Corvallis', 'OR', 97333,
	44.552283, -123.269906, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1
);
