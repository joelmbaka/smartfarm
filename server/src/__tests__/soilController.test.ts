import axios from 'axios';
import { getSoilData } from '../controllers/soilController';
import { SoilCache } from '../models/SoilCache';

// Mock axios and mongoose
jest.mock('axios');
jest.mock('../models/SoilCache');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Soil and Climate Data Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all required soil properties', async () => {
    // Mock successful API responses
    mockedAxios.get
      .mockImplementation((url) => {
        if (url.includes('soilgrids')) {
          return Promise.resolve({
            data: {
              properties: {
                layers: [
                  {
                    name: 'phh2o',
                    depths: [
                      { values: { mean: 65 } },
                      { values: { mean: 63 } },
                      { values: { mean: 62 } }
                    ]
                  },
                  {
                    name: 'soc',
                    depths: [
                      { values: { mean: 35 } },
                      { values: { mean: 30 } },
                      { values: { mean: 25 } }
                    ]
                  },
                  {
                    name: 'nitrogen',
                    depths: [
                      { values: { mean: 20 } },
                      { values: { mean: 18 } },
                      { values: { mean: 15 } }
                    ]
                  },
                  {
                    name: 'cec',
                    depths: [
                      { values: { mean: 150 } },
                      { values: { mean: 140 } },
                      { values: { mean: 130 } }
                    ]
                  },
                  {
                    name: 'bdod',
                    depths: [
                      { values: { mean: 13 } },
                      { values: { mean: 13.2 } },
                      { values: { mean: 13.5 } }
                    ]
                  },
                  {
                    name: 'clay',
                    depths: [
                      { values: { mean: 300 } },
                      { values: { mean: 320 } },
                      { values: { mean: 330 } }
                    ]
                  },
                  {
                    name: 'silt',
                    depths: [
                      { values: { mean: 400 } },
                      { values: { mean: 380 } },
                      { values: { mean: 370 } }
                    ]
                  },
                  {
                    name: 'sand',
                    depths: [
                      { values: { mean: 300 } },
                      { values: { mean: 300 } },
                      { values: { mean: 300 } }
                    ]
                  }
                ]
              }
            }
          });
        } else if (url.includes('elevation')) {
          return Promise.resolve({
            data: {
              results: [{ elevation: 100 }]
            }
          });
        } else {
          return Promise.resolve({
            data: {
              hourly: {
                temperature_2m: Array(24).fill(20),
                relative_humidity_2m: Array(24).fill(60),
                precipitation: Array(24).fill(1),
                wind_speed_10m: Array(24).fill(5),
                direct_radiation: Array(24).fill(800),
                soil_temperature_0cm: Array(24).fill(18)
              },
              daily: {
                temperature_2m_max: [25, 26, 24, 25, 23, 24, 25],
                temperature_2m_min: [15, 16, 14, 15, 13, 14, 15],
                precipitation_sum: [5, 0, 2, 1, 0, 3, 1],
                precipitation_probability_max: [80, 20, 40, 30, 10, 60, 30]
              }
            }
          });
        }
      });

    const req = {
      query: { lat: '0', lng: '0' }
    } as any;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    } as any;

    await getSoilData(req, res);

    // First, check if the response contains any error
    const response = res.json.mock.calls[0][0];
    if (response.error) {
      console.log('Response contained error:', response);
    }

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        soil: expect.objectContaining({
          ph: expect.any(Number),
          organicMatter: expect.any(Number),
          soilType: expect.any(String),
          nitrogen: expect.any(Number),
          phosphorus: expect.any(Number),
          potassium: expect.any(Number),
          drainage: expect.any(String),
          depth: expect.any(Number)
        }),
        terrain: expect.objectContaining({
          elevation: expect.any(Number),
          slope: expect.any(Number)
        }),
        climate: expect.objectContaining({
          temperature: expect.objectContaining({
            current: expect.any(Number),
            min: expect.any(Number),
            max: expect.any(Number)
          }),
          rainfall: expect.any(Number),
          humidity: expect.any(Number),
          solarRadiation: expect.any(Number),
          windSpeed: expect.any(Number),
          frostDays: expect.any(Number),
          growingSeasonLength: expect.any(Number)
        })
      })
    );
  });

  it('should handle missing soil data gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    const req = {
      query: { lat: '0', lng: '0' }
    } as any;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    } as any;

    await getSoilData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String)
      })
    );
  });

  it('should return cached data if available', async () => {
    const mockCachedData = {
      soil: {
        ph: 6.5,
        organicMatter: 2.5,
        soilType: 'Loam',
        nitrogen: 1.2,
        phosphorus: 0.8,
        potassium: 1.5,
        drainage: 'Well-drained',
        depth: 30
      },
      terrain: {
        elevation: 100,
        slope: 2
      },
      climate: {
        temperature: {
          current: 22,
          min: 15,
          max: 28
        },
        rainfall: 5,
        humidity: 65,
        solarRadiation: 800,
        windSpeed: 5,
        frostDays: 0,
        growingSeasonLength: 180
      }
    };

    (SoilCache.findOne as jest.Mock).mockResolvedValueOnce({ data: mockCachedData });

    const req = {
      query: { lat: '0', lng: '0' }
    } as any;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    } as any;

    await getSoilData(req, res);

    expect(res.json).toHaveBeenCalledWith(mockCachedData);
  });
}); 