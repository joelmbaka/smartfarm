router.post('/soil-data', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    // ... rest of your soil data logic
  } catch (error) {
    console.error('Soil data error:', error);
    res.status(500).json({ error: 'Failed to fetch soil data' });
  }
}); 