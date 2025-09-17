import api from './api';

class ExpenseService {
  // Expense Categories
  async getCategories(params = {}) {
    console.log('ExpenseService.getCategories called with params:', params);
    try {
      const response = await api.get('/expenses/categories/', { params });
      console.log('ExpenseService.getCategories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ExpenseService.getCategories error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async createCategory(data) {
    const response = await api.post('/expenses/categories/', data);
    return response.data;
  }

  async updateCategory(id, data) {
    const response = await api.put(`/expenses/categories/${id}/`, data);
    return response.data;
  }

  async deleteCategory(id) {
    const response = await api.delete(`/expenses/categories/${id}/`);
    return response.data;
  }

  // Expenses
  async getExpenses(params = {}) {
    console.log('ExpenseService.getExpenses called with params:', params);
    try {
      const response = await api.get('/expenses/expenses/', { params });
      console.log('ExpenseService.getExpenses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ExpenseService.getExpenses error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async createExpense(data) {
    const response = await api.post('/expenses/expenses/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateExpense(id, data) {
    const response = await api.put(`/expenses/expenses/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteExpense(id) {
    const response = await api.delete(`/expenses/expenses/${id}/`);
    return response.data;
  }

  async getExpenseSummary(params = {}) {
    console.log('ExpenseService.getExpenseSummary called with params:', params);
    try {
      const response = await api.get('/expenses/expenses/summary/', { params });
      console.log('ExpenseService.getExpenseSummary response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ExpenseService.getExpenseSummary error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async getReimbursableExpenses(params = {}) {
    const response = await api.get('/expenses/expenses/reimbursable/', { params });
    return response.data;
  }

  async markExpenseInvoiced(id, invoiceId) {
    const response = await api.post(`/expenses/expenses/${id}/mark_invoiced/`, {
      invoice_id: invoiceId,
    });
    return response.data;
  }

  async addExpensesToInvoice(invoiceId, expenseIds) {
    const response = await api.post('/expenses/expenses/add_to_invoice/', {
      invoice_id: invoiceId,
      expense_ids: expenseIds,
    });
    return response.data;
  }

  // Mileage
  async getMileage(params = {}) {
    console.log('ExpenseService.getMileage called with params:', params);
    try {
      const response = await api.get('/expenses/mileage/', { params });
      console.log('ExpenseService.getMileage response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ExpenseService.getMileage error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async createMileage(data) {
    const response = await api.post('/expenses/mileage/', data);
    return response.data;
  }

  async updateMileage(id, data) {
    const response = await api.put(`/expenses/mileage/${id}/`, data);
    return response.data;
  }

  async deleteMileage(id) {
    const response = await api.delete(`/expenses/mileage/${id}/`);
    return response.data;
  }

  async getReimbursableMileage(params = {}) {
    const response = await api.get('/expenses/mileage/reimbursable/', { params });
    return response.data;
  }

  async markMileageInvoiced(id, invoiceId) {
    const response = await api.post(`/expenses/mileage/${id}/mark_invoiced/`, {
      invoice_id: invoiceId,
    });
    return response.data;
  }

  async addMileageToInvoice(invoiceId, mileageIds) {
    const response = await api.post('/expenses/mileage/add_to_invoice/', {
      invoice_id: invoiceId,
      mileage_ids: mileageIds,
    });
    return response.data;
  }

  async getClientExpenses(clientId) {
    const response = await api.get(`/expenses/expenses/client_expenses/?client_id=${clientId}`);
    return response.data;
  }

  async scanReceipt(receiptFile) {
    const formData = new FormData();
    formData.append('receipt_file', receiptFile);

    const response = await api.post('/expenses/expenses/scan_receipt/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 150000, // 2.5 minutes to match backend timeout + buffer
    });
    return response.data;
  }

  async extractText(receiptFile) {
    const formData = new FormData();
    formData.append('receipt_file', receiptFile);

    const response = await api.post('/expenses/expenses/extract_text/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for text extraction only
    });
    return response.data;
  }

  async autoCreateFromScan(receiptFile) {
    const formData = new FormData();
    formData.append('receipt_file', receiptFile);

    const response = await api.post('/expenses/expenses/scan_receipt/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 150000, // 2.5 minutes to match backend timeout + buffer
    });
    return response.data;
  }

  async getClientMileage(clientId) {
    const response = await api.get(`/expenses/mileage/client_mileage/?client_id=${clientId}`);
    return response.data;
  }

  async getMileageSummary(params = {}) {
    console.log('ExpenseService.getMileageSummary called with params:', params);
    try {
      const response = await api.get('/expenses/mileage/summary/', { params });
      console.log('ExpenseService.getMileageSummary response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ExpenseService.getMileageSummary error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async getIRSRates() {
    const response = await api.get('/expenses/mileage/irs_rates/');
    return response.data;
  }

  // Utility methods
  async getAllReimbursableItems(clientId = null) {
    const params = clientId ? { client: clientId } : {};
    
    const [expenses, mileage] = await Promise.all([
      this.getReimbursableExpenses(params),
      this.getReimbursableMileage(params),
    ]);

    return {
      expenses: expenses || [],
      mileage: mileage || [],
    };
  }

  async markItemsInvoiced(items, invoiceId) {
    const promises = items.map(item => {
      if (item.expense_type === 'expense') {
        return this.markExpenseInvoiced(item.id, invoiceId);
      } else if (item.expense_type === 'mileage') {
        return this.markMileageInvoiced(item.id, invoiceId);
      }
    });

    return Promise.all(promises);
  }

  // Calculate totals
  calculateExpenseTotal(expense) {
    const amount = parseFloat(expense.amount) || 0;
    const taxRate = parseFloat(expense.tax_rate) || 0;
    let taxAmount = 0;

    if (taxRate > 0) {
      if (expense.tax_type === 'inclusive') {
        taxAmount = amount * taxRate / (1 + taxRate);
      } else if (expense.tax_type === 'exclusive') {
        taxAmount = amount * taxRate;
      }
    }

    return {
      subtotal: amount,
      taxAmount: taxAmount,
      total: expense.tax_type === 'exclusive' ? amount + taxAmount : amount,
      netAmount: expense.tax_type === 'inclusive' ? amount - taxAmount : amount,
    };
  }

  calculateMileageTotal(mileage) {
    const miles = parseFloat(mileage.miles) || 0;
    const rate = parseFloat(mileage.rate_per_mile) || 0;
    const total = miles * rate;

    return {
      miles: miles,
      rate: rate,
      total: total,
    };
  }

  // Format helpers
  formatMileageDescription(mileage) {
    if (mileage.start_location && mileage.end_location) {
      return `${mileage.description} (${mileage.start_location} → ${mileage.end_location})`;
    }
    return mileage.description;
  }

  // Export data
  async exportExpenses(params = {}, format = 'csv') {
    const response = await api.get('/expenses/expenses/export/', {
      params: { ...params, format },
      responseType: 'blob',
    });
    return response.data;
  }

  async exportMileage(params = {}, format = 'csv') {
    const response = await api.get('/expenses/mileage/export/', {
      params: { ...params, format },
      responseType: 'blob',
    });
    return response.data;
  }
}

const expenseService = new ExpenseService();
export default expenseService;