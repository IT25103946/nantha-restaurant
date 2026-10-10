package com.example.nantharestaurant.config;

import com.example.nantharestaurant.model.FoodItem;
import com.example.nantharestaurant.repository.FoodRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    /**
     * groupName != null -> the item is a portion of a grouped card
     * (e.g. Chicken Briyani Normal / Large) and the UI shows a
     * portion selector instead of adding directly.
     */
    private record Sample(String name, double price, String imageUrl, String groupName) {}

    private static final List<Sample> SAMPLE_MENU = List.of(
            new Sample("Barotta", 50.00,
                    "https://pngtree.com/freebackground/freshly-sliced-tomato-and-cucumber-served-with-a-plain-paratha-puri-photo_7685917.html", null),
            new Sample("Noodles", 150.00,
                    "https://pngtree.com/freepng/bowl-of-noodles-with-chopsticks_20457900.html", null),
            new Sample("Milk Tea", 120.00,
                    "https://pngtree.com/freepng/fresh-milk-tea-or-indian-kadak-chai-cup-transparent-free-vector_9029945.html", null),
            new Sample("Ulunthu Vada", 80.00,
                    "https://pngtree.com/freepng/crispy-south-indian-medu-vada-with-sambar-and-chutney_23876270.html", null),
            new Sample("Poori", 100.00,
                    "https://pngtree.com/freepng/palak-chole-and-poori-indian-dish-on-transparent-background_24646826.html", null),
            new Sample("Chicken Briyani (Normal)", 600.00,
                    "https://pngtree.com/freepng/chicken-biryani-rice-traditional-indian-food-dish_21540889.html", "Chicken Briyani"),
            new Sample("Chicken Briyani (Large)", 800.00,
                    "https://pngtree.com/freepng/chicken-biryani-rice-traditional-indian-food-dish_21540889.html", "Chicken Briyani"),
            new Sample("Idly", 40.00,
                    "https://pngtree.com/freepng/south-indian-dish-idli-sambar-served-in-terracotta-plates-isolated-on-black-background_20937916.html", null),
            new Sample("Dhosa", 80.00,
                    "https://pngtree.com/freepng/dosa-south-indian-food_9053469.html", null),
            new Sample("Samosa", 60.00,
                    "https://pngtree.com/freepng/best-food-samosa_15743214.html", null)
    );

    private final FoodRepository foodRepository;

    public DataSeeder(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    @Override
    public void run(String... args) {
        syncMenu();
    }

    /**
     * Keeps the database in sync with SAMPLE_MENU so the menu always
     * matches the configured items and prices. Items that are no longer
     * part of the menu are removed.
     */
    private void syncMenu() {
        Map<String, FoodItem> existing = new LinkedHashMap<>();
        for (FoodItem item : foodRepository.findAll()) {
            existing.put(item.getName(), item);
        }
        Set<String> desiredNames = new HashSet<>();

        for (Sample sample : SAMPLE_MENU) {
            desiredNames.add(sample.name());
            FoodItem item = existing.get(sample.name());
            if (item == null) {
                foodRepository.save(new FoodItem(
                        sample.name(), sample.price(), sample.imageUrl(), sample.groupName()));
            } else {
                item.setPrice(sample.price());
                item.setImageUrl(sample.imageUrl());
                item.setGroupName(sample.groupName());
                foodRepository.save(item);
            }
        }

        for (FoodItem item : existing.values()) {
            if (!desiredNames.contains(item.getName())) {
                foodRepository.delete(item);
            }
        }
    }
}
