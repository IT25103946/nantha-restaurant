-- ============================================================
--  Nantha Restaurant - POS / Billing System
--  Database script : MySQL 8.x
--  Run once with MySQL Workbench or:  mysql -u root -p < database.sql
--
--  NOTE: recreates the food_items table with the sample menu
--        below. Back up the table first if you added your own rows.
--
--  Images: image_url holds the source link for each item. If the
--  link cannot be rendered as an image, the frontend falls back to
--  the local photos in  src/main/resources/static/food/  (replace
--  those with your own files, keeping the same names).
--  For live photos use a DIRECT image file URL (ending in .png/.jpg),
--  not a web-page URL.
--
--  Existing database (no re-run needed): just start the app -
--  Hibernate (ddl-auto=update) adds the columns and DataSeeder
--  syncs the table to match the menu below.
-- ============================================================

CREATE DATABASE IF NOT EXISTS restaurant_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE restaurant_db;

-- ------------------------------------------------------------
--  Table: food_items
--  group_name = NULL  -> simple item, tapping the card adds it
--  group_name != NULL -> portion of a grouped item (variant card)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS food_items;

CREATE TABLE food_items (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100)  NOT NULL,
    price      DECIMAL(10,2) NOT NULL,
    image_url  VARCHAR(255)  NULL,
    group_name VARCHAR(100)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_food_items_name (name)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
--  Menu (LKR). INSERT IGNORE keeps the script re-runnable.
-- ------------------------------------------------------------
INSERT IGNORE INTO food_items (name, price, image_url, group_name) VALUES
    ('Barotta',                    50.00,  'https://pngtree.com/freebackground/freshly-sliced-tomato-and-cucumber-served-with-a-plain-paratha-puri-photo_7685917.html', NULL),
    ('Noodles',                   150.00,  'https://pngtree.com/freepng/bowl-of-noodles-with-chopsticks_20457900.html', NULL),
    ('Milk Tea',                  120.00,  'https://pngtree.com/freepng/fresh-milk-tea-or-indian-kadak-chai-cup-transparent-free-vector_9029945.html', NULL),
    ('Ulunthu Vada',               80.00,  'https://pngtree.com/freepng/crispy-south-indian-medu-vada-with-sambar-and-chutney_23876270.html', NULL),
    ('Poori',                     100.00,  'https://pngtree.com/freepng/palak-chole-and-poori-indian-dish-on-transparent-background_24646826.html', NULL),
    ('Chicken Briyani (Normal)',  600.00,  'https://pngtree.com/freepng/chicken-biryani-rice-traditional-indian-food-dish_21540889.html', 'Chicken Briyani'),
    ('Chicken Briyani (Large)',   800.00,  'https://pngtree.com/freepng/chicken-biryani-rice-traditional-indian-food-dish_21540889.html', 'Chicken Briyani'),
    ('Idly',                       40.00,  'https://pngtree.com/freepng/south-indian-dish-idli-sambar-served-in-terracotta-plates-isolated-on-black-background_20937916.html', NULL),
    ('Dhosa',                      80.00,  'https://pngtree.com/freepng/dosa-south-indian-food_9053469.html', NULL),
    ('Samosa',                     60.00,  'https://pngtree.com/freepng/best-food-samosa_15743214.html', NULL);

-- ------------------------------------------------------------
--  Verify
-- ------------------------------------------------------------
SELECT id, name, price, image_url, group_name FROM food_items ORDER BY id;
