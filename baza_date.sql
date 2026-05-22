CREATE DATABASE domomusic;

CREATE USER domomusic_user WITH ENCRYPTED PASSWORD 'domomusic_pass';

GRANT ALL PRIVILEGES ON DATABASE domomusic TO domomusic_user;


DROP TABLE IF EXISTS produse;

DROP TYPE IF EXISTS categ_mare;
DROP TYPE IF EXISTS tip_produs;


CREATE TYPE categ_mare AS ENUM (
    'chitare',
    'clape',
    'tobe',
    'audio',
    'accesorii'
);

CREATE TYPE tip_produs AS ENUM (
    'electric',
    'acustic',
    'studio',
    'live',
    'digital'
);

CREATE TABLE produse (
    id SERIAL PRIMARY KEY,

    nume VARCHAR(100) NOT NULL,

    descriere TEXT NOT NULL,

    imagine VARCHAR(300) NOT NULL,

    categorie categ_mare NOT NULL,

    tip tip_produs NOT NULL,

    pret NUMERIC(10,2) NOT NULL,

    putere_wati INT NOT NULL,

    data_adaugare DATE NOT NULL,

    culoare VARCHAR(50) NOT NULL,

    caracteristici VARCHAR(300) NOT NULL,

    disponibil_stoc BOOLEAN NOT NULL
);





GRANT ALL PRIVILEGES ON TABLE produse TO domomusic_user;
GRANT USAGE, SELECT ON SEQUENCE produse_id_seq TO domomusic_user;




INSERT INTO produse
(nume, descriere, imagine, categorie, tip, pret, putere_wati, data_adaugare, culoare, caracteristici, disponibil_stoc)
VALUES

(
'Fender Stratocaster',
'Chitara electrica versatila pentru rock si blues.',
'/resurse/imagini/produse/stratocaster.jpg',
'chitare',
'electric',
4200.00,
120,
'2025-01-10',
'negru',
'usb,wireless,bluetooth',
true
),

(
'Yamaha Pacifica',
'Chitara electrica ideala pentru incepatori.',
'/resurse/imagini/produse/pacifica.jpg',
'chitare',
'electric',
2100.00,
90,
'2025-02-15',
'albastru',
'usb,wireless',
true
),

(
'Taylor Acoustic 214',
'Chitara acustica premium cu sunet cald.',
'/resurse/imagini/produse/taylor214.jpg',
'chitare',
'acustic',
5300.00,
70,
'2025-03-05',
'natur',
'bluetooth',
false
),

(
'Roland FP-30X',
'Pian digital compact pentru studio si live.',
'/resurse/imagini/produse/fp30x.jpg',
'clape',
'digital',
3900.00,
150,
'2025-01-20',
'alb',
'usb,bluetooth',
true
),

(
'Yamaha PSR-E373',
'Keyboard portabil pentru lectii si repetitii.',
'/resurse/imagini/produse/psr373.jpg',
'clape',
'digital',
1700.00,
80,
'2025-02-02',
'negru',
'usb',
true
),

(
'Nord Stage 4',
'Clapa profesionala pentru concerte live.',
'/resurse/imagini/produse/nordstage4.jpg',
'clape',
'live',
18500.00,
300,
'2025-01-05',
'rosu',
'usb,wireless,bluetooth',
true
),

(
'Pearl Export',
'Set complet de tobe pentru scena.',
'/resurse/imagini/produse/pearl.jpg',
'tobe',
'live',
6200.00,
250,
'2025-03-12',
'negru',
'wireless',
true
),

(
'Roland TD-07',
'Tobe electronice compacte.',
'/resurse/imagini/produse/td07.jpg',
'tobe',
'digital',
4800.00,
180,
'2025-02-25',
'negru',
'usb,bluetooth',
false
),

(
'Shure SM58',
'Microfon legendar pentru voce live.',
'/resurse/imagini/produse/sm58.jpg',
'audio',
'live',
650.00,
60,
'2025-01-18',
'gri',
'wireless',
true
),

(
'Audio Technica AT2020',
'Microfon condensator pentru studio.',
'/resurse/imagini/produse/at2020.jpg',
'audio',
'studio',
890.00,
75,
'2025-01-28',
'negru',
'usb',
true
),

(
'Focusrite Scarlett 2i2',
'Interfata audio USB pentru inregistrari.',
'/resurse/imagini/produse/scarlett.jpg',
'audio',
'studio',
1100.00,
110,
'2025-02-10',
'rosu',
'usb',
true
),

(
'KRK Rokit 5',
'Monitoare de studio pentru mixaj.',
'/resurse/imagini/produse/krk.jpg',
'audio',
'studio',
1600.00,
140,
'2025-03-01',
'galben',
'bluetooth',
false
),

(
'Boss Katana 50',
'Amplificator de chitara cu efecte integrate.',
'/resurse/imagini/produse/katana.jpg',
'accesorii',
'live',
1450.00,
220,
'2025-02-08',
'negru',
'usb,bluetooth',
true
),

(
'Line 6 Pod Go',
'Procesor multi-efect pentru chitara.',
'/resurse/imagini/produse/podgo.jpg',
'accesorii',
'digital',
2600.00,
130,
'2025-03-15',
'negru',
'usb,wireless',
true
),

(
'Beyerdynamic DT770',
'Casti profesionale pentru studio.',
'/resurse/imagini/produse/dt770.jpg',
'audio',
'studio',
950.00,
65,
'2025-01-30',
'negru',
'wireless',
true
);


SELECT * FROM produse;




