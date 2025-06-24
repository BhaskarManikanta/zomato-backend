import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { initConsumer } from './kafka/consumer.js';
import { initProducer, producer } from './kafka/producer.js';
const redis=require('./config/redis.js')
const {verifyJWT}=require('./middlewares/auth.js')
const Agent=require('./config/db.js')

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5003;

connectDB()
  .then(async () => {
    await initProducer();
    await initConsumer(producer);
    app.listen(PORT, () => {
      console.log(`Agent Service running on port ${PORT}`);
    });
  })
  .catch(err => console.error(err));


  app.post('/api/agents/register', async (req, res) => {
  try {
    const { name, email, password, latitude, longitude } = req.body;

    const existing = await Agent.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const agent = new Agent({
      name,
      email,
      password: hashedPassword,
      currentLocation: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      status: 'available'
    });

    await agent.save();

    res.status(201).json({ message: 'Agent registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/agents/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const agent = await Agent.findOne({ email });
    if (!agent) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: agent._id, email: agent.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, agentId: agent._id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

  app.put('/agents/:id/location',verifyJWT, async (req, res) => {
  try {
    const agentId = req.params.id;
    const { latitude, longitude } = req.body;

    const agent = await Agent.findById(agentId);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // Update MongoDB location
    agent.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    await agent.save();

    // Update Redis GEO only if agent is available
    if (agent.status === 'available') {
      await redis.geoadd('agents:locations', longitude, latitude, agentId);
    }

    res.json({ message: 'Agent location updated', agentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Re-enable agent availability
app.put('/agents/:id/status',verifyJWT, async (req, res) => {
  try {
    const agentId = req.params.id;
    const agent = await Agent.findById(agentId);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const [lng, lat] = agent.currentLocation.coordinates;

    // Update status
    agent.status = 'available';
    await agent.save();

    // Re-add to Redis GEO
    await redis.geoadd('agents:locations', lng, lat, agentId);

    res.json({ message: 'Agent is now available again', agentId });
  } catch (err) {
    console.error('Agent availability error:', err);
    res.status(500).json({ error: 'Failed to update agent availability' });
  }
});


