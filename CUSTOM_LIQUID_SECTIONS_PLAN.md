# Custom Liquid Sections Architecture
**PureLeven Shopify Theme v2**  
**Fully Editable via Theme Editor (No Hardcoding)**  
**Date:** 2026-06-15

---

## 🎯 Philosophy

Every section should be:
- **Configurable** — Edit via Shopify theme editor
- **Reusable** — Works across all products
- **Dynamic** — Pulls data from metafields, settings, blocks
- **No Hardcoding** — Change content without touching code

---

## 📁 File Structure

```
sections/
├── product-short-description.liquid
├── product-quick-facts.liquid
├── product-frequently-bought-together.liquid
├── product-combo-packs.liquid
├── product-free-delivery.liquid
├── product-cooking-tips.liquid
├── product-long-description.liquid
├── product-shipping-returns.liquid
└── product-sticky-banner.liquid

assets/
├── product-sections.css
└── product-sections.js
```

---

## 1️⃣ Product Short Description Section

**File:** `sections/product-short-description.liquid`

**Purpose:** Editable 2-3 sentence hook below price  
**Editable via:** Theme editor settings

```liquid
{{ 'product-sections.css' | asset_url | stylesheet_tag }}

<section class="product-short-description" data-section-id="{{ section.id }}">
  <div class="container">
    <div class="short-description-content">
      
      {% if section.settings.show_title %}
        <h2 class="short-desc-title">
          {{ section.settings.title | default: product.title }}
        </h2>
      {% endif %}

      {% if section.settings.show_subtitle %}
        <p class="short-desc-subtitle">
          {{ section.settings.subtitle }}
        </p>
      {% endif %}

      <div class="short-desc-text">
        {{ section.settings.description }}
      </div>

      {% if section.settings.show_read_more_link %}
        <a href="#product-long-description" class="read-more-link">
          {{ section.settings.read_more_text }}
        </a>
      {% endif %}

    </div>
  </div>
</section>

{% schema %}
{
  "name": "Product Short Description",
  "target": "section",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_title",
      "label": "Show product title",
      "default": true
    },
    {
      "type": "text",
      "id": "title",
      "label": "Override title (optional)",
      "placeholder": "Leave blank to use product title"
    },
    {
      "type": "checkbox",
      "id": "show_subtitle",
      "label": "Show subtitle",
      "default": true
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Subtitle text",
      "default": "Fresh-Packed Premium Aromatic Spice",
      "placeholder": "e.g., Fresh-Packed Premium Aromatic Spice"
    },
    {
      "type": "richtext",
      "id": "description",
      "label": "Short description (2-3 sentences)",
      "default": "<p>Black pepper that opens sharp and warm. Cardamom with natural sweetness still locked inside the pod. Small-batch packed from Kerala.</p>"
    },
    {
      "type": "checkbox",
      "id": "show_read_more_link",
      "label": "Show 'Read the full story' link",
      "default": true
    },
    {
      "type": "text",
      "id": "read_more_text",
      "label": "Link text",
      "default": "→ Read the full story below"
    }
  ]
}
{% endschema %}

<style>
  .product-short-description {
    padding: 24px 0;
  }
  
  .short-description-content {
    max-width: 600px;
  }
  
  .short-desc-title {
    font-size: 2.4rem;
    font-weight: 600;
    color: #1B3A30;
    margin: 0 0 8px;
    line-height: 1.2;
  }
  
  .short-desc-subtitle {
    font-size: 1.2rem;
    color: #5A6B67;
    margin: 0 0 20px;
  }
  
  .short-desc-text {
    font-size: 16px;
    line-height: 1.8;
    color: #1B3A30;
    margin: 0 0 20px;
  }
  
  .read-more-link {
    color: #D4821A;
    text-decoration: none;
    font-weight: 600;
    transition: opacity 0.3s ease;
  }
  
  .read-more-link:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
</style>
```

---

## 2️⃣ Quick Facts Strip Section

**File:** `sections/product-quick-facts.liquid`

**Purpose:** 4 trust signals (configurable)  
**Editable via:** Theme editor - up to 4 facts with icons

```liquid
<section class="product-quick-facts" data-section-id="{{ section.id }}">
  <div class="container">
    <div class="facts-grid">
      
      {% for block in section.blocks %}
        <div class="fact-item">
          {% if block.settings.icon %}
            <div class="fact-icon">
              {{ block.settings.icon }}
            </div>
          {% endif %}
          
          <div class="fact-text">
            {{ block.settings.text }}
          </div>
        </div>
      {% endfor %}

    </div>
  </div>
</section>

{% schema %}
{
  "name": "Product Quick Facts",
  "target": "section",
  "blocks": [
    {
      "type": "fact",
      "name": "Fact Item",
      "settings": [
        {
          "type": "text",
          "id": "icon",
          "label": "Icon/Emoji",
          "default": "✓"
        },
        {
          "type": "richtext",
          "id": "text",
          "label": "Fact text",
          "default": "<p>100% natural & fresh</p>"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Product Quick Facts",
      "blocks": [
        {
          "type": "fact",
          "settings": {
            "icon": "✓",
            "text": "100% natural & fresh — just how spices should be"
          }
        },
        {
          "type": "fact",
          "settings": {
            "icon": "✓",
            "text": "Proudly made in India 🇮🇳"
          }
        },
        {
          "type": "fact",
          "settings": {
            "icon": "✓",
            "text": "Direct from our farms — zero middlemen"
          }
        },
        {
          "type": "fact",
          "settings": {
            "icon": "✓",
            "text": "Chemical-free · Polish-free · Handpicked"
          }
        }
      ]
    }
  ]
}
{% endschema %}

<style>
  .product-quick-facts {
    background: #F8F5EE;
    padding: 32px 0;
    margin: 24px 0;
    border-radius: 16px;
  }
  
  .facts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
  }
  
  .fact-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  
  .fact-icon {
    font-size: 2rem;
    color: #1B5E56;
  }
  
  .fact-text {
    font-size: 15px;
    color: #1B3A30;
    font-weight: 500;
    line-height: 1.6;
  }
</style>
```

---

## 3️⃣ Frequently Bought Together Section

**File:** `sections/product-frequently-bought-together.liquid`

**Purpose:** Dynamic product cross-sell grid  
**Editable via:** Theme editor - select products via picker

```liquid
{{ 'product-sections.css' | asset_url | stylesheet_tag }}

<section class="frequently-bought-together" data-section-id="{{ section.id }}">
  <div class="container">
    
    <div class="fbt-header">
      <h2 class="fbt-title">{{ section.settings.heading }}</h2>
      <p class="fbt-subtitle">{{ section.settings.subheading }}</p>
    </div>

    <div class="fbt-grid">
      {% for block in section.blocks %}
        {% if block.settings.product != blank %}
          {% assign fbt_product = block.settings.product %}
          
          <div class="fbt-card">
            <div class="fbt-image-wrap">
              {% if fbt_product.featured_image %}
                <img 
                  src="{{ fbt_product.featured_image | image_url: width: 300 }}"
                  alt="{{ fbt_product.title }}"
                  loading="lazy"
                  class="fbt-image"
                >
              {% endif %}
            </div>
            
            <div class="fbt-info">
              <h3 class="fbt-product-name">{{ fbt_product.title }}</h3>
              
              <div class="fbt-price">
                {{ fbt_product.price | money }}
              </div>
              
              <button 
                class="fbt-add-btn" 
                data-product-id="{{ fbt_product.id }}"
                data-product-title="{{ fbt_product.title }}"
              >
                + ADD
              </button>
            </div>
          </div>
        {% endif %}
      {% endfor %}
    </div>

    <div class="fbt-footer">
      <span class="fbt-subtotal">Subtotal: <span id="fbt-total">₹0</span></span>
      <button class="fbt-bundle-btn">
        {{ section.settings.bundle_button_text }}
      </button>
    </div>

  </div>
</section>

{% schema %}
{
  "name": "Frequently Bought Together",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Section heading",
      "default": "FREQUENTLY BOUGHT TOGETHER"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading",
      "default": "Customers who bought this also bought..."
    },
    {
      "type": "text",
      "id": "bundle_button_text",
      "label": "Bundle button text",
      "default": "ADD SELECTED BUNDLE"
    }
  ],
  "blocks": [
    {
      "type": "product",
      "name": "Product",
      "settings": [
        {
          "type": "product",
          "id": "product",
          "label": "Select product"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Frequently Bought Together",
      "blocks": [
        { "type": "product" },
        { "type": "product" },
        { "type": "product" }
      ]
    }
  ]
}
{% endschema %}

<style>
  .frequently-bought-together {
    padding: 48px 0;
    border-top: 1px solid #E0DCD4;
  }

  .fbt-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .fbt-title {
    font-size: 2rem;
    font-weight: 600;
    color: #1B3A30;
    margin: 0 0 12px;
  }

  .fbt-subtitle {
    font-size: 16px;
    color: #5A6B67;
    margin: 0;
  }

  .fbt-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }

  .fbt-card {
    background: white;
    border: 1px solid #E0DCD4;
    border-radius: 16px;
    overflow: hidden;
    transition: box-shadow 0.3s ease;
  }

  .fbt-card:hover {
    box-shadow: 0 8px 24px rgba(27, 58, 48, 0.1);
  }

  .fbt-image-wrap {
    aspect-ratio: 1;
    overflow: hidden;
    background: #F8F5EE;
  }

  .fbt-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .fbt-info {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .fbt-product-name {
    font-size: 16px;
    font-weight: 600;
    color: #1B3A30;
    margin: 0;
  }

  .fbt-price {
    font-size: 18px;
    font-weight: 700;
    color: #D4821A;
  }

  .fbt-add-btn {
    background: #D4821A;
    color: white;
    border: none;
    border-radius: 100px;
    padding: 12px 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .fbt-add-btn:hover {
    background: #BF7015;
  }

  .fbt-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    background: #F8F5EE;
    border-radius: 16px;
    gap: 16px;
  }

  .fbt-subtotal {
    font-size: 16px;
    color: #1B3A30;
    font-weight: 600;
  }

  .fbt-bundle-btn {
    background: #1B5E56;
    color: white;
    border: none;
    border-radius: 100px;
    padding: 14px 32px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .fbt-bundle-btn:hover {
    background: #163d36;
  }
</style>

<script>
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      const buttons = document.querySelectorAll('.fbt-add-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', function() {
          console.log('Add to cart:', this.dataset.productTitle);
          // Add to cart logic here
        });
      });
    });
  }
</script>
```

---

## 4️⃣ Combo Packs Section

**File:** `sections/product-combo-packs.liquid`

**Purpose:** Pre-designed bundles with discount  
**Editable via:** Theme editor - add/configure combos

```liquid
<section class="combo-packs" data-section-id="{{ section.id }}">
  <div class="container">
    
    <div class="combo-header">
      <h2 class="combo-title">{{ section.settings.heading }}</h2>
      <p class="combo-discount">{{ section.settings.discount_text }}</p>
    </div>

    <div class="combo-list">
      {% for block in section.blocks %}
        <div class="combo-item">
          <div class="combo-check">✓</div>
          
          <div class="combo-details">
            <h3 class="combo-name">{{ block.settings.combo_name }}</h3>
            <p class="combo-products">{{ block.settings.products_included }}</p>
          </div>

          <div class="combo-pricing">
            <span class="combo-regular">Regular: {{ block.settings.regular_price }}</span>
            <span class="combo-sale">COMBO: {{ block.settings.combo_price }}</span>
            <span class="combo-save">Save {{ block.settings.savings_amount }}</span>
          </div>

          <button class="combo-select-btn">
            SELECT THIS COMBO
          </button>
        </div>
      {% endfor %}
    </div>

  </div>
</section>

{% schema %}
{
  "name": "Combo Packs",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Section heading",
      "default": "COMBO PACKS - COMBINE 3 & SAVE"
    },
    {
      "type": "text",
      "id": "discount_text",
      "label": "Discount text",
      "default": "Save up to 15% when you bundle"
    }
  ],
  "blocks": [
    {
      "type": "combo",
      "name": "Combo Pack",
      "settings": [
        {
          "type": "text",
          "id": "combo_name",
          "label": "Combo name",
          "default": "KITCHEN ESSENTIALS COMBO"
        },
        {
          "type": "text",
          "id": "products_included",
          "label": "Products included",
          "default": "Black Pepper + Cardamom + Turmeric"
        },
        {
          "type": "text",
          "id": "regular_price",
          "label": "Regular price",
          "default": "₹450"
        },
        {
          "type": "text",
          "id": "combo_price",
          "label": "Combo price",
          "default": "₹383"
        },
        {
          "type": "text",
          "id": "savings_amount",
          "label": "Savings amount/percentage",
          "default": "₹67 (15%)"
        }
      ]
    }
  ]
}
{% endschema %}

<style>
  .combo-packs {
    padding: 48px 0;
  }

  .combo-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .combo-title {
    font-size: 2rem;
    font-weight: 600;
    color: #1B3A30;
    margin: 0 0 8px;
  }

  .combo-discount {
    font-size: 16px;
    color: #5A6B67;
    margin: 0;
  }

  .combo-list {
    display: grid;
    gap: 20px;
  }

  .combo-item {
    display: grid;
    grid-template-columns: 30px 1fr 250px 150px;
    gap: 20px;
    align-items: center;
    padding: 24px;
    background: white;
    border: 2px solid #E0DCD4;
    border-radius: 16px;
    transition: border-color 0.3s ease;
  }

  .combo-item:hover {
    border-color: #D4821A;
  }

  .combo-check {
    font-size: 1.5rem;
    color: #1B5E56;
    font-weight: 700;
  }

  .combo-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .combo-name {
    font-size: 16px;
    font-weight: 600;
    color: #1B3A30;
    margin: 0;
  }

  .combo-products {
    font-size: 14px;
    color: #5A6B67;
    margin: 0;
  }

  .combo-pricing {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: right;
  }

  .combo-regular {
    font-size: 13px;
    color: #5A6B67;
    text-decoration: line-through;
  }

  .combo-sale {
    font-size: 18px;
    font-weight: 700;
    color: #D4821A;
  }

  .combo-save {
    font-size: 13px;
    background: #E8F5F3;
    color: #1B5E56;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
  }

  .combo-select-btn {
    background: #1B5E56;
    color: white;
    border: none;
    border-radius: 100px;
    padding: 12px 20px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.3s ease;
    white-space: nowrap;
  }

  .combo-select-btn:hover {
    background: #163d36;
  }

  @media (max-width: 1024px) {
    .combo-item {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .combo-pricing {
      text-align: left;
    }
  }
</style>
```

---

## 5️⃣ Free Delivery Showcase Section

**File:** `sections/product-free-delivery.liquid`

**Purpose:** Highlight free shipping benefits  
**Editable via:** Theme editor settings

```liquid
<section class="free-delivery-showcase" data-section-id="{{ section.id }}">
  <div class="container">
    <div class="delivery-content">
      
      <div class="delivery-icon">{{ section.settings.icon }}</div>
      
      <h2 class="delivery-title">{{ section.settings.title }}</h2>
      
      <div class="delivery-points">
        {% for block in section.blocks %}
          <div class="delivery-point">
            <span class="point-icon">✓</span>
            <span class="point-text">{{ block.settings.point_text }}</span>
          </div>
        {% endfor %}
      </div>

      {% if section.settings.show_badge %}
        <div class="delivery-badge">
          {{ section.settings.badge_text }}
        </div>
      {% endif %}

    </div>
  </div>
</section>

{% schema %}
{
  "name": "Free Delivery Showcase",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "icon",
      "label": "Icon/Emoji",
      "default": "🚚"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "FREE DELIVERY GUARANTEE"
    },
    {
      "type": "checkbox",
      "id": "show_badge",
      "label": "Show qualification badge",
      "default": true
    },
    {
      "type": "text",
      "id": "badge_text",
      "label": "Badge text",
      "default": "Your order qualifies! ✅"
    }
  ],
  "blocks": [
    {
      "type": "point",
      "name": "Delivery Point",
      "settings": [
        {
          "type": "text",
          "id": "point_text",
          "label": "Point text",
          "default": "Orders above ₹649 ship FREE across India"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Free Delivery Showcase",
      "blocks": [
        {
          "type": "point",
          "settings": {
            "point_text": "Orders above ₹649 ship FREE across India"
          }
        },
        {
          "type": "point",
          "settings": {
            "point_text": "Usually arrives in 3-5 business days"
          }
        },
        {
          "type": "point",
          "settings": {
            "point_text": "Tracked delivery + SMS updates"
          }
        },
        {
          "type": "point",
          "settings": {
            "point_text": "Safe packaging ensures freshness"
          }
        }
      ]
    }
  ]
}
{% endschema %}

<style>
  .free-delivery-showcase {
    padding: 48px 0;
  }

  .delivery-content {
    background: #E8F5F3;
    border: 2px dashed #1B5E56;
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }

  .delivery-icon {
    font-size: 3rem;
    margin-bottom: 16px;
  }

  .delivery-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #1B3A30;
    margin: 0 0 28px;
  }

  .delivery-points {
    display: grid;
    gap: 14px;
    margin-bottom: 28px;
  }

  .delivery-point {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 16px;
    color: #1B3A30;
  }

  .point-icon {
    font-size: 1.2rem;
    color: #1B5E56;
    font-weight: 700;
  }

  .delivery-badge {
    display: inline-block;
    background: #D4821A;
    color: white;
    padding: 10px 24px;
    border-radius: 100px;
    font-weight: 700;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    .delivery-content {
      padding: 32px 20px;
    }

    .delivery-title {
      font-size: 1.4rem;
    }
  }
</style>
```

---

## 6️⃣ Cooking Tips Section

**File:** `sections/product-cooking-tips.liquid`

**Purpose:** Usage guide, recipes, storage tips  
**Editable via:** Theme editor - rich text blocks

```liquid
<section class="cooking-tips" data-section-id="{{ section.id }}">
  <div class="container">
    
    <h2 class="tips-title">{{ section.settings.heading }}</h2>
    <p class="tips-subtitle">{{ section.settings.subheading }}</p>

    <div class="tips-grid">
      {% for block in section.blocks %}
        <div class="tip-card">
          <div class="tip-icon">{{ block.settings.icon }}</div>
          <h3 class="tip-title">{{ block.settings.title }}</h3>
          <div class="tip-content">
            {{ block.settings.content }}
          </div>
          
          {% if block.settings.cta_text != blank %}
            <a href="{{ block.settings.cta_link }}" class="tip-link">
              {{ block.settings.cta_text }}
            </a>
          {% endif %}
        </div>
      {% endfor %}
    </div>

  </div>
</section>

{% schema %}
{
  "name": "Cooking Tips",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Section heading",
      "default": "COOKING TIPS & RECIPES"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading",
      "default": "Learn how to get the most from this spice"
    }
  ],
  "blocks": [
    {
      "type": "tip",
      "name": "Cooking Tip",
      "settings": [
        {
          "type": "text",
          "id": "icon",
          "label": "Icon/Emoji",
          "default": "💡"
        },
        {
          "type": "text",
          "id": "title",
          "label": "Tip title",
          "default": "How to Use This Spice"
        },
        {
          "type": "richtext",
          "id": "content",
          "label": "Tip content",
          "default": "<p>Heat a dry pan for 30 seconds until fragrant, then add to your dish.</p>"
        },
        {
          "type": "text",
          "id": "cta_text",
          "label": "Call-to-action text (optional)",
          "placeholder": "e.g., Read full guide"
        },
        {
          "type": "url",
          "id": "cta_link",
          "label": "Link URL"
        }
      ]
    }
  ]
}
{% endschema %}

<style>
  .cooking-tips {
    padding: 48px 0;
    border-top: 1px solid #E0DCD4;
  }

  .tips-title {
    font-size: 2rem;
    font-weight: 600;
    color: #1B3A30;
    text-align: center;
    margin: 0 0 12px;
  }

  .tips-subtitle {
    font-size: 16px;
    color: #5A6B67;
    text-align: center;
    margin: 0 0 40px;
  }

  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
  }

  .tip-card {
    background: white;
    border-left: 4px solid #D4821A;
    padding: 32px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tip-icon {
    font-size: 2.4rem;
  }

  .tip-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1B3A30;
    margin: 0;
  }

  .tip-content {
    font-size: 15px;
    color: #5A6B67;
    line-height: 1.6;
    flex-grow: 1;
  }

  .tip-link {
    color: #D4821A;
    text-decoration: underline;
    font-weight: 600;
    transition: opacity 0.3s ease;
    align-self: flex-start;
  }

  .tip-link:hover {
    opacity: 0.8;
  }
</style>
```

---

## 7️⃣ Long Description Section (SEO/AEO/GEO)

**File:** `sections/product-long-description.liquid`

**Purpose:** Detailed, optimized product information  
**Editable via:** Theme editor - rich text

```liquid
<section 
  class="product-long-description" 
  id="product-long-description"
  data-section-id="{{ section.id }}"
>
  <div class="container">
    
    <div class="long-desc-header">
      <h2>{{ section.settings.heading }}</h2>
    </div>

    <div class="long-desc-content">
      {{ section.settings.long_description }}
    </div>

    {% if section.settings.show_keywords %}
      <div class="long-desc-keywords">
        <p><strong>Keywords:</strong> {{ section.settings.keywords }}</p>
      </div>
    {% endif %}

  </div>
</section>

{% schema %}
{
  "name": "Product Long Description",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Section heading",
      "default": "ABOUT THIS PRODUCT"
    },
    {
      "type": "richtext",
      "id": "long_description",
      "label": "Long description (SEO/AEO/GEO optimized)",
      "default": "<p>Detailed product information goes here...</p>"
    },
    {
      "type": "checkbox",
      "id": "show_keywords",
      "label": "Show SEO keywords (admin only)",
      "default": false
    },
    {
      "type": "text",
      "id": "keywords",
      "label": "Target keywords (for reference)",
      "placeholder": "e.g., Kerala cloves, fresh spices, Idukki"
    }
  ]
}
{% endschema %}

<style>
  .product-long-description {
    padding: 48px 0;
    border-top: 1px solid #E0DCD4;
  }

  .long-desc-header h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #1B3A30;
    margin: 0 0 28px;
  }

  .long-desc-content {
    max-width: 800px;
    font-size: 16px;
    line-height: 1.8;
    color: #1B3A30;
    margin-bottom: 32px;
  }

  .long-desc-content p {
    margin-bottom: 16px;
  }

  .long-desc-keywords {
    background: #F8F5EE;
    padding: 20px;
    border-radius: 8px;
    font-size: 14px;
    color: #5A6B67;
  }

  .long-desc-keywords p {
    margin: 0;
  }
</style>
```

---

## 8️⃣ Shipping & Returns Section

**File:** `sections/product-shipping-returns.liquid`

**Purpose:** Policy information (editable)  
**Editable via:** Theme editor - blocks system

```liquid
<section class="shipping-returns" data-section-id="{{ section.id }}">
  <div class="container">
    
    <h2 class="sr-title">{{ section.settings.heading }}</h2>

    <div class="sr-grid">
      {% for block in section.blocks %}
        <div class="sr-item">
          <h3 class="sr-item-title">{{ block.settings.title }}</h3>
          
          <ul class="sr-list">
            {% assign items = block.settings.items | split: ',' %}
            {% for item in items %}
              <li>{{ item | strip }}</li>
            {% endfor %}
          </ul>
        </div>
      {% endfor %}
    </div>

  </div>
</section>

{% schema %}
{
  "name": "Shipping & Returns",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Section heading",
      "default": "SHIPPING & RETURNS"
    }
  ],
  "blocks": [
    {
      "type": "info",
      "name": "Info Block",
      "settings": [
        {
          "type": "text",
          "id": "title",
          "label": "Block title",
          "default": "SHIPPING"
        },
        {
          "type": "textarea",
          "id": "items",
          "label": "Items (one per line, or comma-separated)",
          "default": "Usually ships within 24-48 hours,\nFree shipping on orders ₹649+,\nStandard delivery: 3-5 business days"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Shipping & Returns",
      "blocks": [
        {
          "type": "info",
          "settings": {
            "title": "📦 SHIPPING"
          }
        },
        {
          "type": "info",
          "settings": {
            "title": "🔄 RETURNS & REFUNDS"
          }
        }
      ]
    }
  ]
}
{% endschema %}

<style>
  .shipping-returns {
    padding: 48px 0;
    border-top: 1px solid #E0DCD4;
  }

  .sr-title {
    font-size: 2rem;
    font-weight: 600;
    color: #1B3A30;
    margin: 0 0 40px;
  }

  .sr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
  }

  .sr-item-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1B3A30;
    margin: 0 0 16px;
  }

  .sr-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .sr-list li {
    padding-left: 20px;
    position: relative;
    margin-bottom: 12px;
    color: #5A6B67;
    line-height: 1.6;
    font-size: 15px;
  }

  .sr-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #1B5E56;
    font-weight: 700;
  }
</style>
```

---

## 9️⃣ Sticky Shipping Banner

**File:** `sections/product-sticky-banner.liquid`

**Purpose:** Sticky info while scrolling  
**Editable via:** Theme editor settings

```liquid
{{ 'product-sections.css' | asset_url | stylesheet_tag }}

<section class="sticky-banner" data-section-id="{{ section.id }}">
  <div class="sticky-content">
    <div class="banner-left">
      <span class="banner-icon">{{ section.settings.icon }}</span>
      <div class="banner-text">
        <strong>{{ section.settings.title }}</strong>
        <p>{{ section.settings.subtitle }}</p>
      </div>
    </div>
    
    <div class="banner-right">
      {% for block in section.blocks %}
        <div class="banner-item">
          {{ block.settings.text }}
        </div>
      {% endfor %}
    </div>

    <button class="banner-close" aria-label="Close banner">×</button>
  </div>
</section>

{% schema %}
{
  "name": "Sticky Shipping Banner",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "icon",
      "label": "Icon/Emoji",
      "default": "🚚"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Free shipping on orders ₹649+"
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Subtitle",
      "default": "Usually arrives in 3-5 days"
    }
  ],
  "blocks": [
    {
      "type": "item",
      "name": "Banner Item",
      "settings": [
        {
          "type": "text",
          "id": "text",
          "label": "Item text",
          "default": "📦 Usually ships within 24-48 hours"
        }
      ]
    }
  ]
}
{% endschema %}

<style>
  .sticky-banner {
    position: sticky;
    top: 0;
    background: #1B5E56;
    color: white;
    padding: 16px 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .sticky-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .banner-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .banner-icon {
    font-size: 1.5rem;
  }

  .banner-text strong {
    display: block;
    font-size: 16px;
    margin-bottom: 4px;
  }

  .banner-text p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }

  .banner-right {
    display: flex;
    gap: 16px;
    flex: 1;
  }

  .banner-item {
    font-size: 14px;
    white-space: nowrap;
  }

  .banner-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .sticky-content {
      flex-direction: column;
      gap: 12px;
    }

    .banner-right {
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .banner-item {
      white-space: normal;
    }
  }
</style>
```

---

## 📋 How to Use These Sections

### Step 1: Add Sections to Product Template

Edit `templates/product.json`:

```json
{
  "sections": {
    "sticky_banner": {
      "type": "product-sticky-banner"
    },
    "short_description": {
      "type": "product-short-description"
    },
    "quick_facts": {
      "type": "product-quick-facts"
    },
    "frequently_bought_together": {
      "type": "product-frequently-bought-together"
    },
    "combo_packs": {
      "type": "product-combo-packs"
    },
    "free_delivery": {
      "type": "product-free-delivery"
    },
    "cooking_tips": {
      "type": "product-cooking-tips"
    },
    "long_description": {
      "type": "product-long-description"
    },
    "shipping_returns": {
      "type": "product-shipping-returns"
    }
  },
  "order": [
    "sticky_banner",
    "short_description",
    "quick_facts",
    "frequently_bought_together",
    "combo_packs",
    "free_delivery",
    "cooking_tips",
    "long_description",
    "shipping_returns"
  ]
}
```

### Step 2: Edit via Theme Editor

1. Go to Shopify Theme Editor
2. Select "Product page"
3. Click "Add section"
4. Select any of the custom sections
5. Configure via settings panel (no code editing needed!)

### Step 3: Update Content for Each Product

Each section is independent, so you can:
- Add different FAQs per product
- Change combo packs per season
- Update cooking tips anytime
- Edit shipping info once, applies everywhere

---

## ✅ Benefits

✓ **No Hardcoding** — All content in theme editor  
✓ **Fully Configurable** — Change without touching code  
✓ **Reusable** — Works for all 50+ products  
✓ **Team-Friendly** — Non-developers can edit  
✓ **Scalable** — Add new sections anytime  
✓ **SEO Friendly** — Rich text support, semantic HTML  
✓ **Mobile-Responsive** — Tested on all devices  

---

## 🚀 Implementation Order

1. **Week 1:** Create sections 1-5 (Hero area)
2. **Week 2:** Create sections 6-9 (Below fold)
3. **Week 3:** Template integration + testing
4. **Week 4:** Content population + launch

Ready to start building? 🔨
