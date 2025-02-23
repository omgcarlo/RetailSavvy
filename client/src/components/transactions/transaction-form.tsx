import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Product,
  InsertTransaction,
  InsertTransactionItem,
} from "@shared/schema";
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
import { Currency, currencies, formatCurrency } from "@/lib/currency";
import { useCurrency } from "@/hooks/use-currency";
import { format } from "date-fns"; // Added by Carlo

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
    try {
      // Calculate the total cost of the transaction
      const total = calculateTotal();

      // Prepare the transaction items
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity, // Send as a number
        price: Number(item.product.price).toFixed(2),
      }));

      // Serialize the date object into an ISO string
      const date = new Date(); // Current date
      const formattedDate = date.toISOString(); // "2025-02-23T00:00:00.000Z"

      // Log the prepared transaction data for debugging purposes
      console.log("Submitting transaction data:", {
        total: total.toFixed(2),
        isPaid: 1, // Send as a number
        items,
        date: formattedDate, // Serialized date
        customerId: null,
      });

      // Send the transaction data to the backend using the mutation
      createTransaction.mutate(
        {
          total: total.toFixed(2),
          isPaid: 1, // Send as a number
          items,
          date: date, // Serialized date
          customerId: null,
        },
        {
          onError: (error: Error) => {
            console.error("Error creating transaction:", error);
            toast({
              title: "Failed to create transaction",
              description: error.message || "An unexpected error occurred.",
              variant: "destructive",
            });
          },
        },
      );
    } catch (error) {
      console.error("Unexpected error in handleSubmit:", error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
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
              {formatCurrency(product.price, currency)}
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
                  {formatCurrency(item.product.price, currency)}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.product.id, e.target.value)
                    }
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  {formatCurrency(
                    Number(item.product.price) * item.quantity,
                    currency,
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
          Total: {formatCurrency(calculateTotal(), currency)}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={cart.length === 0 || createTransaction.isPending}
        >
          {createTransaction.isPending
            ? "Processing..."
            : "Complete Transaction"}
        </Button>
      </div>
    </div>
  );
}
