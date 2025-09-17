import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CalculatorIcon } from '@heroicons/react/24/solid';

const Calculator = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [expression, setExpression] = useState('');

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const inputNumber = (num) => {
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }

    // If we just finished an operation (no operation pending), clear expression
    if (!operation && previousValue === null && expression.includes('=')) {
      setExpression('');
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }

    // If we just finished an operation (no operation pending), clear expression
    if (!operation && previousValue === null && expression.includes('=')) {
      setExpression('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
    setExpression('');
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      // First operation - just store the value and operation
      if (nextOperation === '=') {
        // Just pressed equals without any operation
        setExpression(`${inputValue} = ${inputValue}`);
        return;
      }
      setPreviousValue(inputValue);
      setExpression(`${inputValue} ${getOperationSymbol(nextOperation)}`);
      setWaitingForNewValue(true);
      setOperation(nextOperation);
    } else if (operation && nextOperation === '=') {
      // Only calculate when equals is pressed
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      // Show final result
      setExpression(`${currentValue} ${getOperationSymbol(operation)} ${inputValue} = ${newValue}`);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    } else if (operation && nextOperation !== '=') {
      // Chain operations - calculate previous, then start new operation
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setExpression(`${newValue} ${getOperationSymbol(nextOperation)}`);
      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setWaitingForNewValue(true);
      setOperation(nextOperation);
    } else {
      // We have a previousValue but no operation (after equals)
      if (nextOperation === '=') {
        return; // Do nothing
      }
      setExpression(`${inputValue} ${getOperationSymbol(nextOperation)}`);
      setPreviousValue(inputValue);
      setWaitingForNewValue(true);
      setOperation(nextOperation);
    }
  };

  // Helper function to get readable operation symbols
  const getOperationSymbol = (op) => {
    switch (op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      default: return op;
    }
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      inputNumber(parseInt(e.key));
    } else if (e.key === '.') {
      inputDecimal();
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
      performOperation(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
      performOperation('=');
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
      clear();
    } else if (e.key === 'Backspace') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
    }
  };

  // Drag functionality
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep calculator within viewport bounds
    const maxX = window.innerWidth - 320; // calculator width is 320px (w-80)
    const maxY = window.innerHeight - 400; // approximate calculator height

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      // Position calculator in top-right area by default
      const defaultX = window.innerWidth - 400; // 400px from right edge
      const defaultY = 100; // 100px from top
      setPosition({
        x: Math.max(0, defaultX),
        y: defaultY
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed bg-white rounded-lg shadow-2xl w-80 overflow-hidden z-50 border border-gray-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
        {/* Header */}
        <div
          className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <CalculatorIcon className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Calculator</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-indigo-700 rounded-full p-1"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Display */}
        <div className="bg-gray-900 p-4">
          <div className="bg-gray-800 rounded p-3 text-right">
            {expression && (
              <div className="text-gray-400 text-sm font-mono mb-1 overflow-hidden">
                {expression}
              </div>
            )}
            <div className="text-white text-2xl font-mono overflow-hidden">
              {display}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-2 bg-gray-100">
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <button
              onClick={clear}
              className="col-span-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => performOperation('/')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-4 rounded transition-colors text-xl"
            >
              ÷
            </button>
            <button
              onClick={() => performOperation('*')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-4 rounded transition-colors text-xl"
            >
              ×
            </button>

            {/* Row 2 */}
            <button
              onClick={() => inputNumber(7)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors"
            >
              7
            </button>
            <button
              onClick={() => inputNumber(8)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors"
            >
              8
            </button>
            <button
              onClick={() => inputNumber(9)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors"
            >
              9
            </button>
            <button
              onClick={() => performOperation('-')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-4 rounded transition-colors text-xl"
            >
              −
            </button>

            {/* Row 3 */}
            <button
              onClick={() => inputNumber(4)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors"
            >
              4
            </button>
            <button
              onClick={() => inputNumber(5)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors"
            >
              5
            </button>
            <button
              onClick={() => inputNumber(6)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors"
            >
              6
            </button>
            <button
              onClick={() => performOperation('+')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-4 rounded transition-colors text-xl"
            >
              +
            </button>

            {/* Row 4 */}
            <button
              onClick={() => inputNumber(1)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors"
            >
              1
            </button>
            <button
              onClick={() => inputNumber(2)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors"
            >
              2
            </button>
            <button
              onClick={() => inputNumber(3)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors"
            >
              3
            </button>
            <button
              onClick={() => performOperation('=')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded row-span-2 transition-colors text-xl"
            >
              =
            </button>

            {/* Row 5 */}
            <button
              onClick={() => inputNumber(0)}
              className="col-span-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors"
            >
              0
            </button>
            <button
              onClick={inputDecimal}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded shadow transition-colors text-xl"
            >
              .
            </button>
          </div>
        </div>

        {/* Footer tip */}
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center">
          Tip: Use keyboard for faster calculations • Drag header to move
        </div>
    </div>
  );
};

export default Calculator;