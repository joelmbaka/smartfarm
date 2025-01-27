import mongoose, { Document, Schema } from 'mongoose';

interface ISoilCache extends Document {
  latitude: number;
  longitude: number;
  data: {
    soil: {
      ph: number;
      organicMatter: number;
      soilType: string;
      nitrogen: number;
      phosphorus: number;
      potassium: number;
      drainage: string;
      depth: number;
    };
    terrain: {
      elevation: number;
      slope: number;
    };
    climate: {
      temperature: {
        current: number;
        min: number;
        max: number;
      };
      rainfall: number;
      humidity: number;
      solarRadiation: number;
      windSpeed: number;
      frostDays: number;
      growingSeasonLength: number;
    };
  };
  createdAt: Date;
}

const SoilCacheSchema = new Schema<ISoilCache>({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  data: {
    soil: {
      ph: Number,
      organicMatter: Number,
      soilType: String,
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      drainage: String,
      depth: Number
    },
    terrain: {
      elevation: Number,
      slope: Number
    },
    climate: {
      temperature: {
        current: Number,
        min: Number,
        max: Number
      },
      rainfall: Number,
      humidity: Number,
      solarRadiation: Number,
      windSpeed: Number,
      frostDays: Number,
      growingSeasonLength: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // 7 days
  }
});

// Create compound index for location queries
SoilCacheSchema.index({ latitude: 1, longitude: 1 }, { unique: true });

// We removed the duplicate createdAt index since it's already defined in the schema field

export const SoilCache = mongoose.model<ISoilCache>('SoilCache', SoilCacheSchema); 