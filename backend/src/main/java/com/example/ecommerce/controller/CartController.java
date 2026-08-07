package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CartItemRequest;
import com.example.ecommerce.dto.CartItemResponse;
import com.example.ecommerce.dto.CartResponse;
import com.example.ecommerce.model.CartItem;
import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

// NOTE: This is a single, global, demo cart (no auth/session) -- good
// enough to demonstrate persistence end-to-end. A real app would scope
// cart items to a user/session id.
@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public CartResponse getCart() {
        List<CartItemResponse> items = cartItemRepository.findAll().stream()
                .map(CartItemResponse::new)
                .collect(Collectors.toList());
        return new CartResponse(items);
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(@RequestBody CartItemRequest request) {
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        }

        int qtyToAdd = request.getQuantity() <= 0 ? 1 : request.getQuantity();

        CartItem item = cartItemRepository.findByProductId(product.getId())
                .orElse(new CartItem(product, 0));
        item.setQuantity(item.getQuantity() + qtyToAdd);
        cartItemRepository.save(item);

        return ResponseEntity.ok(getCart());
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody CartItemRequest request) {
        CartItem item = cartItemRepository.findById(id).orElse(null);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart item not found");
        }

        if (request.getQuantity() <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
        }

        return ResponseEntity.ok(getCart());
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> removeItem(@PathVariable Long id) {
        if (!cartItemRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart item not found");
        }
        cartItemRepository.deleteById(id);
        return ResponseEntity.ok(getCart());
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart() {
        cartItemRepository.deleteAll();
        return ResponseEntity.ok(getCart());
    }
}
