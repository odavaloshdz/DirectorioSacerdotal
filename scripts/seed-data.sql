-- Insertar ciudades iniciales
INSERT OR IGNORE INTO cities (id, name, state, createdAt, updatedAt) VALUES
('clxxx001', 'San Juan de los Lagos', 'Jalisco', datetime('now'), datetime('now')),
('clxxx002', 'Guadalajara', 'Jalisco', datetime('now'), datetime('now')),
('clxxx003', 'Lagos de Moreno', 'Jalisco', datetime('now'), datetime('now')),
('clxxx004', 'Tepatitlán', 'Jalisco', datetime('now'), datetime('now')),
('clxxx005', 'Encarnación de Díaz', 'Jalisco', datetime('now'), datetime('now'));

-- Insertar especialidades iniciales
INSERT OR IGNORE INTO specialties (id, name, description, createdAt, updatedAt) VALUES
('clxxx101', 'Dirección Espiritual', 'Acompañamiento espiritual personalizado', datetime('now'), datetime('now')),
('clxxx102', 'Liturgia', 'Celebraciones litúrgicas y sacramentos', datetime('now'), datetime('now')),
('clxxx103', 'Catequesis', 'Enseñanza y formación en la fe', datetime('now'), datetime('now')),
('clxxx104', 'Juventud', 'Pastoral juvenil y vocacional', datetime('now'), datetime('now')),
('clxxx105', 'Matrimonios', 'Preparación matrimonial y familiar', datetime('now'), datetime('now')),
('clxxx106', 'Familia', 'Pastoral familiar', datetime('now'), datetime('now')),
('clxxx107', 'Formación', 'Formación de laicos y agentes pastorales', datetime('now'), datetime('now')),
('clxxx108', 'Misiones', 'Actividad misionera', datetime('now'), datetime('now')),
('clxxx109', 'Pastoral Social', 'Acción social y caridad', datetime('now'), datetime('now')),
('clxxx110', 'Educación', 'Ministerio educativo', datetime('now'), datetime('now')),
('clxxx111', 'Música Sacra', 'Ministerio musical litúrgico', datetime('now'), datetime('now')),
('clxxx112', 'Arte Sacro', 'Arte y expresión religiosa', datetime('now'), datetime('now'));

-- Insertar parroquias iniciales
INSERT OR IGNORE INTO parishes (id, name, cityId, address, phone, email, createdAt, updatedAt) VALUES
('clxxx201', 'Basílica de Nuestra Señora de San Juan de los Lagos', 'clxxx001', 'Plaza Principal s/n, Centro', '395 785 0570', 'basilica@diocesisdesanjuan.org', datetime('now'), datetime('now')),
('clxxx202', 'Parroquia San José', 'clxxx001', 'Calle Hidalgo 123', '395 785 1234', NULL, datetime('now'), datetime('now')),
('clxxx203', 'Parroquia del Sagrado Corazón', 'clxxx003', 'Centro Histórico', NULL, NULL, datetime('now'), datetime('now')),
('clxxx204', 'Catedral Metropolitana', 'clxxx002', 'Av. Alcalde 10, Centro Histórico', NULL, NULL, datetime('now'), datetime('now')),
('clxxx205', 'Parroquia San Miguel Arcángel', 'clxxx004', 'Calle Morelos 45', '378 781 2345', NULL, datetime('now'), datetime('now')); 