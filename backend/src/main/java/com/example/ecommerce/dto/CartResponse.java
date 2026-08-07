package com.example.ecommerce.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {
    private List<CartItemResponse> items;
    private BigDecimal total;

    public CartResponse(List<CartItemResponse> items) {
        this.items = items;
        this.total = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<CartItemResponse> getItems() { return items; }
    public BigDecimal getTotal() { return total; }
}
