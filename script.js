/*O salaryModal será uma entrada que uma vez informada,
 será repetida todo mês automaticamente na data indicada
 OU MELHOR:
 adicionar um radio button que ao ser escolhido fara com que
 a transacao adicionada se repita mensalmente na data indicada*/

const Modal = {
  toggle() {
    document
    .querySelector('#transaction-modal')
    .classList.toggle('active')
  
    document.querySelector('input#description').focus()
  },

  transactionConfirmed() {
    const confirmModal = document.querySelector('.sucess-modal')

    confirmModal.classList.add('sucess-modal-active')

    setTimeout(() => {
      confirmModal.classList.remove('sucess-modal-active')
    }, 600)
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },

  set(transactions) {
    localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
  }
}


const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },

  incomes() {
    let income = 0
    Transaction.all.forEach(transaction => {
      if(transaction.amount > 0) {
        income += transaction.amount
      }
    })

    return income
  },

  expenses() {
    let expense = 0
    Transaction.all.forEach(transaction => {
      if(transaction.amount < 0) {
        expense += transaction.amount
      }
    })

    return expense
  },

  total() {
    const total = Transaction.incomes() + Transaction.expenses()
    return total
  }
}

const DOM = {

  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index
    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass =
      transaction.amount > 0
      ? 'income'
      : 'expense'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `
    return html
  },

  updtadeBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const Utils = {

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''
    
    
    value = String(value).replace(/\D/g, '')
    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  },

  formatAmount(value) {
    value = Number(value) * 100 
    return value
  },

  formatDate(date) {
    date = date.split('-')
    date = date.reverse()
    return  `${date[0]}/${date[1]}/${date[2]}`
  }
}

const Form =  {

  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()

    if( description.trim() === '' ||
        amount.trim() === '' ||
        date.trim() === '') {
          throw new Error('Preencha todos os campos!')
        }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount  = Utils.formatAmount(amount)
    date = Utils.formatDate(date)
    
    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''

    Form.description.focus()
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields()
      const transaction = Form.formatValues()
      Transaction.add(transaction)
      Form.clearFields()

      Modal.transactionConfirmed()

    } catch (error) {

      alert(error.message)
    }
  }
}

const App = {
  init() {

    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })

    DOM.updtadeBalance()
    Storage.set(Transaction.all)
  },

  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()




