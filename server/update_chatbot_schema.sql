
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
    id SERIAL PRIMARY KEY,
    keywords TEXT NOT NULL, -- Palabras clave separadas por coma (ej: "horario, abrir, hora")
    answer TEXT NOT NULL,   -- La respuesta del bot
    match_type VARCHAR(20) DEFAULT 'contains', -- 'contains' (contiene la palabra) o 'exact'
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos datos por defecto para que no esten vacios
INSERT INTO chatbot_knowledge (keywords, answer) VALUES 
('ubicacion, direccion, donde estan', 'Nuestra tienda principal está en Av. Tecnológico #123. Abrimos de Lunes a Viernes de 8am a 7pm.'),
('telefono, celular, marcar, numero', 'Puedes contactarnos al 662-202-8681 o dar clic en el botón de WhatsApp.'),
('envios, domicilio, llevar', 'Sí contamos con servicio a domicilio. Es gratis en compras mayores a $2,000.')
ON CONFLICT DO NOTHING;
