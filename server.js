import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint vacío para acciones de OBR
app.post('/obr-action', (req, res) => {
    try {
        // Aquí se añadirá la lógica para ejecutar acciones en OBR
        console.log('Received OBR action request:', req.body);

        // Por ahora, solo devolvemos una respuesta vacía
        res.json({
            success: true,
            message: 'OBR action endpoint ready',
            receivedData: req.body
        });
    } catch (error) {
        console.error('Error in OBR action endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Endpoint de salud para verificar que el servidor funciona
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'OBR Action Server is running'
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 OBR Action Server running on port ${port}`);
    console.log(`📡 Health check: http://localhost:${port}/health`);
    console.log(`🎯 OBR Action endpoint: http://localhost:${port}/obr-action`);
});

export default app;
