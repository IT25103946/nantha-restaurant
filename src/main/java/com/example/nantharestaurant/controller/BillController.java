package com.example.nantharestaurant.controller;

import com.example.nantharestaurant.model.FoodItem;
import com.example.nantharestaurant.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "*") // Frontend-udan thodarpu kolla anumatikkirathu
public class BillController {

    @Autowired
    private FoodRepository foodRepository;

    // Ellaa unavu porutkalaiyum pera
    @GetMapping("/items")
    public List<FoodItem> getAllFoodItems() {
        return foodRepository.findAll();
    }

    // Puthia unavu porutlai serkka (thevaippattaal)
    @PostMapping("/add")
    public FoodItem addFoodItem(@RequestBody FoodItem foodItem) {
        return foodRepository.save(foodItem);
    }
}