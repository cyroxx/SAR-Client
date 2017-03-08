export class Case{
    
    _id: string;
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

    toString() {
        return this._id;
    }
}

export class Location {
    _id: string;
    longitude: number;
    latitude: number;
    heading: any;
    timestamp: number;
    itemId: string;
    type: LocationType;

    constructor(longitude: number, latitude: number, heading: any, timestamp: number, itemId: string, type: LocationType, reporter?: string, id?: string) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.heading = heading;
        this.timestamp = timestamp;
        this.itemId = itemId;
        this.type = type;
        this._id = id ? id : new Date().toISOString() + "-reportedBy-" + reporter ? reporter : 'anonymous';
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

export enum LocationType {
    Case = 1,
    Vehcile
}