// usinf IIFE

// BUDGET CONTROLLER
var budgetController = (function(){
  // function Constructor

  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0){
    this.percentage = Math.round((this.value / totalIncome) * 100);
  }
  else {
    this.percentage = -1;
  }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  };
  //data Structure
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals:{
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
return{
  addItem: function(type, des, val){
    var newItem, ID;

    // creating a new item
    if(data.allItems[type].length > 0){
      ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

    }
    else {
      ID = 0;
    }
    // adding a element to 'exp' or 'inp'
    if(type === 'exp'){
      newItem = new Expense(ID, des, val);
    }
    else if(type === 'inc') {
      newItem = new Income(ID, des, val);
    }
    data.allItems[type].push(newItem);
    return newItem;
  },
  deleteItem: function(type, id){
    var ids, index;

    ids = data.allItems[type].map(function(current){
      return current.id;
    });
    index = ids.indexOf(id);

    if(index !== -1){
      data.allItems[type].splice(index, 1); // splice delete the element of the given position
    }
  },

  calculateBudget: function(){
    // Calculate total income and expences
    calculateTotal('exp');
    calculateTotal('inc');

    // Calculate the budget: income - expences
    data.budget = data.totals.inc - data.totals.exp;

    //Calculate the percentageof income that we spent
    if(data.totals.inc > 0 && data.totals.inc > data.totals.exp){
      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    }
    else {
      data.percentage = -1;
    }
  },

  calculatePercentages: function(){
    data.allItems.exp.forEach(function(cur){
      cur.calcPercentage(data.totals.inc);
    });
  },
  getPercentages: function(){
    var allPerc = data.allItems.exp.map(function(cur){
      return cur.getPercentage();
    });
    return allPerc;
  },
  getBudget: function(){
      return{
        budget: data.budget,
        totalExp: data.totals.exp,
        totalInc: data.totals.inc,
        percentage: data.percentage
      };
  },

  testing: function(){
    console.log(data);
  }
};

})();


//UI CONTROLLER
var uIController = (function(){
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expencesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expencesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };
  var formatNumber = function(num, type){
    var numSplit, int, dec;
    /*
    + or - before the Number
      exatly 2 decimal points
      comma seperating 1000's
    */
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if(int.length > 3){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int +'.'+ dec;

  };
  var nodeListForEach = function(list, callback){
    for(var i = 0; i < list.length; i++){
      callback(list[i], i);
    }
  };
  return{
    getInput: function(){
      return{
        type: document.querySelector(DOMstrings.inputType).value, // will be either "imp" or "exp"
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type){
      var html, newHtml, element;
      // create Html string with placeholder text
      if(type === 'inc'){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>';
      }
      else if(type === 'exp'){
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div>';
      }
      //replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      // Insert the HTML into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID){
      var el = document.getElementById(selectorID);

      el.parentNode.removeChild(el);
    },

    clearfields: function(){
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);// call is used to invoke a methord into the other fields.
      fieldsArr.forEach(function(current, index, array){
        current.value = "";
      });
      fieldsArr[0].focus();// sets the pointer to that box
    },

    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expencesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      if(obj.percentage > 0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      }
      else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';

      }
    },
    displayPercentages: function(percentages){
      var fields = document.querySelectorAll(DOMstrings.expencesPercLabel);// List not an array


      nodeListForEach(fields, function(current, index){
        if(percentages[index] > 0 && percentages[index] <= 100){
          current.textContent = percentages[index] + '%';
        }
        else {
          current.textContent = '---';
        }
      });
    },
    displayMonth: function(){
      var now, year, months, month;
      now = new Date();

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },
    changedType: function(){

      var fields = document.querySelectorAll(
        DOMstrings.inputType+ ','+DOMstrings.inputDescription+','+DOMstrings.inputValue);

        nodeListForEach(fields, function(cur){
          cur.classList.toggle('red-focus');
        });
        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },
      getDOMstrings: function(){
        return DOMstrings;
      }
    };
})();



//GLOBAL AND APP CONTROLLER
var controller = (function(budgectCtrl, uICtrl){

  var setUpEventListener = function(){
    var DOM = uICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    document.addEventListener('keypress', function(event){
      if(event.keyCode === 13 || event.which === 13){
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', uIController.changedType);
  };

  var updateBudget = function(){
    //1. Calculate the budget
    budgectCtrl.calculateBudget();
    //2. Return the budget
    var budget = budgectCtrl.getBudget();
    //3. Display the budget in the UI
    uICtrl.displayBudget(budget);
  };

  var updatePercentages = function(){
    // 1. Calculate percentages
    budgectCtrl.calculatePercentages();
    //2. Read percentages from the budgetController
    var percentages = budgectCtrl.getPercentages();
    //3. update the UI with new percentages
    uICtrl.displayPercentages(percentages);
  }

  var ctrlAddItem = function(){
    var input, newItem;
    //1. Get the field input data
    input = uICtrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value > 0){

      //2. Add the item to the budget controller
      newItem = budgectCtrl.addItem(input.type, input.description, input.value);

      //3. Add the item to the UI
      uICtrl.addListItem(newItem, input.type);

      //4. clear fields
      uICtrl.clearfields();

      //5. Calculate and updateBudget
      updateBudget();

      //6. calculate and updatePercentages
      updatePercentages();
    }

  };

  var ctrlDeleteItem = function(event){
    var itemID, splitID, type, ID;
    console.log();
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID){
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from datastructure
      budgectCtrl.deleteItem(type, ID);
      //2. Delete the item from UI
      uICtrl.deleteListItem(itemID);
      // 3. Update and show the new budget
      updateBudget();

      //4. calculate and updatePercentages
      updatePercentages();
    }
  };

return{
  init: function(){
    uICtrl.displayMonth();
    uICtrl.displayBudget({
      budget: 0,
      totalExp: 0,
      totalInc: 0,
      percentage: -1
    });
    setUpEventListener();
  }
};


})(budgetController, uIController);

controller.init();
