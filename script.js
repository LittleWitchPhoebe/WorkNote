// ============================================
// 待办事项列表 - JavaScript 练习项目
// ============================================
// 
// 🎯 你的任务：实现以下功能
// 1. 添加待办事项
// 2. 删除待办事项
// 3. 标记完成/未完成（点击文字切换状态）
// 4. 更新统计信息
//
// 💡 提示：你需要用到以下 JavaScript 知识
// - DOM 操作 (getElementById, createElement, appendChild, removeChild)
// - 事件监听 (addEventListener)
// - 数组方法 (push, filter, map)
// - 解构赋值
// - 箭头函数
// ============================================

// 获取 DOM 元素
const todoInput = document.getElementById('todoInput');
const searchInput=document.getElementById('searchInput');   
const prioritySelect = document.getElementById('prioritySelect');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const clearCompletedBtn =document.getElementById('clearCompletedBtn');
const toast=document.getElementById('toast');
if(!toast){
    console.error('toast 元素不存在,html中没有这个元素');
}
let searchTerm='';
if(searchInput){
    searchInput.addEventListener('input',(e)=>{
        searchTerm=(e.target.value || ' ').trim();
        renderTodos();
    });
}

// 存储待办事项的数组
// 每个待办事项是一个对象：{ id: 唯一标识, text: 文本内容, completed: 是否完成 }
let todos = [];
//
function saveTodos(){
    const todoString =JSON.stringify(todos);
    localStorage.setItem('todos',todoString);
    console.log(todos);
}
function loadTodos(){
    const todoString =localStorage.getItem('todos');
    if(todoString){
        todos=JSON.parse(todoString);           
    } else {
        todos=[];
    }
}
// ============================================
// 功能 1: 添加待办事项
// ============================================
// 提示：
// 1. 监听 addBtn 的 'click' 事件
// 2. 获取 todoInput 的值
// 3. 如果输入不为空，创建一个新的 todo 对象并添加到 todos 数组
// 4. 调用 renderTodos() 重新渲染列表
// 5. 清空输入框
// ============================================

// TODO: 实现添加功能
addBtn.addEventListener('click', () => {
    // 你的代码写在这里
    const text = todoInput.value.trim();
    const priority = prioritySelect ? prioritySelect.value : 'low';
    if (text === '') {
        return;
    }
    const newTodo = {
        id:Date.now(),
        text:text,
        completed:false,
        priority:priority
    }
   todos.push(newTodo);
   saveTodos();
   renderTodos();
   todoInput.value = '';
});


// 提示：也可以监听回车键
todoInput.addEventListener('keypress', (e) => {
    // 如果按下回车键，触发添加
    // 你的代码写在这里
    const text = todoInput.value.trim();
    if(text===''){
        return;
    }
    if(e.key=='Enter'){
        const priority = prioritySelect ? prioritySelect.value : 'low';
        const newTodo = {
            id:Date.now(),
        text:text,
        completed:false,
        priority:priority
        }
       todos.push(newTodo);
       saveTodos();
       renderTodos();
       todoInput.value = '';
    }
});

// ============================================
// 功能 2: 删除待办事项
// ============================================
// 提示：
// 1. 使用数组的 filter 方法过滤掉指定 id 的 todo
// 2. 重新渲染列表
// ============================================
function showToast(message) {
    // 安全检查：确保 toast 元素存在
    if(!toast){
        console.error('toast 元素不存在');
        return;
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(()=>{
        toast.classList.remove('show');
    },2000);
}
function deleteTodo(id) {
    // 在删除前，先找到要删除的待办事项，保存它的文本
    const deletedTodo = todos.find(todo => todo.id === id);
    const deletedText = deletedTodo ? deletedTodo.text : '';
    
    // 使用 filter 方法删除
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    
    // 显示删除成功的提示
    showToast(`已删除：${deletedText}`);
}

// ============================================
// 功能 3: 切换完成状态
// ============================================
// 提示：
// 1. 使用数组的 map 方法找到对应 id 的 todo
// 2. 切换它的 completed 属性
// 3. 重新渲染列表
// ============================================

function toggleTodo(id) {
    // 你的代码写在这里
    // 使用 map 方法：todos = todos.map(todo => ...)
    todos=todos.map(todo=>
        todo.id===id?{...todo,completed:!todo.completed}:todo
    );
    saveTodos();
    renderTodos();
}
function editTodo(id, newText) {
    const trimmedText = newText.trim();
    if(trimmedText === ''){
        return;
    }
    todos = todos.map(todo =>
        todo.id === id
            ? { ...todo, text: trimmedText }
            : todo
    );
    saveTodos();
    renderTodos();
}
// ============================================
// 功能 4: 渲染待办事项列表
// ============================================
// 提示：
// 1. 清空 todoList 的内容
// 2. 如果 todos 数组为空，显示空状态
// 3. 使用 forEach 或 map 遍历 todos 数组
// 4. 为每个 todo 创建 DOM 元素
// 5. 添加事件监听器（删除按钮、点击文字切换状态）
// ============================================

function renderTodos() {
    // 清空列表
    todoList.innerHTML = '';

    // 根据搜索词过滤待办事项
    const filtered=todos.filter(todo=>
        todo.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    //如果过滤后数组为空，显示无结果        
    if(filtered.length===0){
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = searchTerm?'没有找到匹配的待办事项':'还没有待办事项，添加一个吧！';
        todoList.appendChild(emptyState);
        updateStats(filtered);
        return;
    }

    // 如果数组为空，显示空状态
    // if (todos.length === 0) {
    //     const emptyState = document.createElement('div');
    //     emptyState.className = 'empty-state';
    //     emptyState.textContent = '还没有待办事项，添加一个吧！';
    //     todoList.appendChild(emptyState);
    //     updateStats();
    //     return;
    // }

    // TODO: 遍历 todos 数组，创建每个待办事项的 DOM 元素
    
    // 提示：使用 forEach 或 map
        filtered.forEach(todo => {

        // 创建 todo-item div
        const todoItem=document.createElement('div');
        todoItem.className='todo-item';
        if(todo.completed){
            todoItem.classList.add('completed');
        }
        //复选框
        const checkbox=document.createElement('input');
        checkbox.type='checkbox';
        checkbox.className='todo-checkbox';
        checkbox.id=`checkbox-${todo.id}`;
        checkbox.name=`checkbox-${todo.id}`;
        checkbox.checked=todo.completed;
        checkbox.addEventListener('change',()=>{
            toggleTodo(todo.id);
        });
        

        const todoText=document.createElement('span');
        todoText.textContent = todo.text;
        todoText.className='todo-text text';  // 直接设置两个类名
        // todoText.addEventListener('click',()=>toggleTodo(todo.id));
        //区别双击，单击
        // 兼容旧数据：如果没有 priority，默认为 'low'
        const priority = todo.priority || 'low';
        
        // 给 todoItem 添加优先级类名，用于边框颜色
        todoItem.classList.add(`priority-${priority}`);
       
        let clickTimer=null;
        todoText.addEventListener('click',(e)=>{
            if(clickTimer) {
                clearTimeout(clickTimer);
            }
            clickTimer=setTimeout(() => {
                toggleTodo(todo.id);
                
            }, 300);
        });
        
        

        // 双击进入编辑界面
        todoText.addEventListener('dblclick',(e)=>{
            e.stopPropagation(); // 阻止事件冒泡，避免触发点击切换状态
            e.preventDefault();
            if(clickTimer) {
                clearTimeout(clickTimer);
                clickTimer=null;
            }

            
        //阻止默认
           
            console.log('dbclick',todo.text);

            const editInput = document.createElement('input');
            editInput.type = 'text';  
            editInput.value = todo.text;
            editInput.className = 'todo-edit-input';

            // 保存原始文本，用于取消编辑
            const originalText = todo.text;
            const todoId = todo.id; // 保存 id，避免闭包问题

            // 用 input 替换 span
            todoText.replaceWith(editInput);
            editInput.focus();
            editInput.select();

            // 保存编辑
            const saveEdit = () => {
                const newText = editInput.value.trim();
                if (newText && newText !== originalText) {
                    editTodo(todoId, newText);
                } else {
                    // 如果为空或未改变，恢复原文本
                    renderTodos(); // 重新渲染，恢复原状态
                }
            };

            // ESC 取消编辑
            const cancelEdit = () => {
                renderTodos(); // 重新渲染，恢复原状态
            };

            // 失去焦点时保存
            editInput.addEventListener('blur', saveEdit);
            
            // 键盘事件
            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEdit();
                }
            });
        });

      

        const deleteBtn=document.createElement('button');
        deleteBtn.textContent='删除';
        deleteBtn.className='btn btn-danger';
        deleteBtn.addEventListener('click',()=>deleteTodo(todo.id));

        todoItem.appendChild(checkbox);
        todoItem.appendChild(todoText);
        todoItem.appendChild(deleteBtn);
        todoList.appendChild(todoItem);
       
    });


    // 更新统计信息
    updateStats(filtered);
}

// ============================================
// 功能 5: 更新统计信息
// ============================================
// 提示：
// 1. 计算总数：todos.length
// 2. 计算已完成数：使用 filter 方法统计 completed 为 true 的数量
// ============================================

function updateStats(list=todos) {
    // 你的代码写在这里
    // totalCount.textContent = ... 
    // completedCount.textContent = ...
    totalCount.textContent = todos.length;
    const completed=todos.filter(todo => todo.completed==true).length;
    completedCount.textContent = completed;
}

function clearCompleted(){
    const completedCount =todos.filter(todo=>todo.completed === true).length;
    if(completedCount===0){
        showToast('No completed task!')
        return ;
    }
    todos =todos.filter(todo =>!todo.completed);
    saveTodos();
    renderTodos();
    if(completedCount>0){
        showToast(`Deleted ${completedCount} tasks`);
    }
}
clearCompletedBtn.addEventListener('click',clearCompleted);


// ============================================
// 初始化：页面加载时渲染
// ============================================

loadTodos();
renderTodos();

