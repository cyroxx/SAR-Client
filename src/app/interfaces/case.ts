export class Case {
    location: Location;
    state: Status;
    boatType: BoatType;
		boatCondition: BoatCondition;
		engineWorking: boolean;
		peopleCount: number;
		womenCount: number;
		childrenCount: number;
		disabledCount: number;

    constructor() {
    }

}

export class Location {
    longitude: number;
    latitude: number;
    heading: any;
    timestamp: number;

		constructor(longitude: number, latitude: number, heading: any, timestamp: number){
			this.longitude = longitude;
			this.latitude = latitude;
			this.heading = heading;
			this.timestamp = timestamp;
		}
}

export enum Status {
    'Need Help' = 1,
    Critical,
    Rescued,
    'Confirmed Target',
    'Possible Target',
    Attended,
    Closed
}

export enum BoatType {
    Rubber = 1,
    Wood,
    Steel,
    Other
}

export enum BoatCondition {
    Unknown = 1,
    Good,
    Bad,
    Sinking,
    'People in water'
}
