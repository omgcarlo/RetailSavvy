import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, InsertTransaction, InsertTransactionItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Trash2 } from "lucide-react";
import { Currency, currencies, formatCurrency, convertCurrency } from "@/lib/currency";
import { useCurrency } from "@/hooks/use-currency";

type CartItem = {
  product: Product;
  quantity: number;
};

export function TransactionForm() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { currency } = useCurrency(); // Use global currency context
  const { toast } = useToast();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createTransaction = useMutation({
    mutationFn: async (data: {
      transaction: InsertTransaction;
      items: InsertTransactionItem[];
    }) => {
      return await apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Transaction created successfully" });
      setCart([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, value: string) => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity < 1) return;
    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0,
    );
  };

  const handleSubmit = () => {
    const total = calculateTotal();
    // Convert all amounts to USD for storage
    const items = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity.toString(),
      price: convertCurrency(Number(item.product.price), currency, "USD").toFixed(2),
    }));

    createTransaction.mutate({
      total: convertCurrency(total, currency, "USD").toFixed(2),
      isPaid: "1",
      items,
      date: new Date(),
      customerId: null,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.map((product) => (
          <Button
            key={product.id}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => addToCart(product)}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-8 h-8 rounded object-cover"
              />
            ) : (
              <Package className="w-8 h-8" />
            )}
            <span className="text-sm font-medium">{product.name}</span>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(convertCurrency(product.price, "USD", currency), currency)}
            </span>
          </Button>
        ))}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.map((item) => (
              <TableRow key={item.product.id}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>
                  {formatCurrency(
                    convertCurrency(item.product.price, "USD", currency),
                    currency
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product.id, e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  {formatCurrency(
                    convertCurrency(
                      Number(item.product.price) * item.quantity,
                      "USD",
                      currency
                    ),
                    currency
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Total: {formatCurrency(
            convertCurrency(calculateTotal(), "USD", currency),
            currency
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={cart.length === 0 || createTransaction.isPending}
        >
          {createTransaction.isPending ? "Processing..." : "Complete Transaction"}
        </Button>
      </div>
    </div>
  );
}