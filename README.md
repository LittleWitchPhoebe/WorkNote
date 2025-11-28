# 📝 待办事项列表 - JavaScript 练习项目

这是一个用原生 JavaScript 实现的待办事项列表项目，非常适合作为学习 React 前的过渡练习。

## 🎯 项目目标

通过实现这个项目，你将练习到以下 JavaScript 核心概念：

- ✅ DOM 操作（获取元素、创建元素、添加/删除元素）
- ✅ 事件监听（点击事件、键盘事件）
- ✅ 数组方法（`map()`, `filter()`, `forEach()`）
- ✅ 解构赋值
- ✅ 箭头函数
- ✅ 对象操作

## 🚀 如何使用

1. 直接在浏览器中打开 `index.html` 文件
2. 打开 `script.js` 文件，按照注释提示实现功能
3. 保存后刷新浏览器查看效果

## 📋 需要实现的功能

### 1. 添加待办事项
- 点击"添加"按钮或按回车键，将输入框的内容添加到列表
- 输入框不能为空

### 2. 删除待办事项
- 点击每项后面的"删除"按钮，移除该项

### 3. 标记完成/未完成
- 点击待办事项的文字，切换完成状态
- 完成的项目显示为灰色并带删除线

### 4. 统计信息
- 实时显示总数量和已完成数量

## 💡 实现提示

### 添加功能
```javascript
// 获取输入值
const text = todoInput.value.trim();

// 创建新 todo 对象
const newTodo = {
    id: Date.now(), // 使用时间戳作为唯一 ID
    text: text,
    completed: false
};

// 添加到数组
todos.push(newTodo);
```

### 删除功能
```javascript
// 使用 filter 过滤掉指定 id 的项
todos = todos.filter(todo => todo.id !== id);
```

### 切换完成状态
```javascript
// 使用 map 找到对应项并切换状态
todos = todos.map(todo => 
    todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
);
```

### 创建 DOM 元素
```javascript
// 创建元素
const item = document.createElement('div');
item.className = 'todo-item';

// 添加内容
const textSpan = document.createElement('span');
textSpan.textContent = todo.text;

// 添加到父元素
todoList.appendChild(item);
```

## 🧪 测试你的理解

完成项目后，尝试理解以下代码：

```javascript
// 1. 数组解构与默认值
const [isActive, setIsActive] = [false, function(){/*...*/}]

// 2. 箭头函数与隐式返回
const double = (arr) => arr.map(num => num * 2);

// 3. 对象字面量增强
const name = "Gemini";
const user = { name, age: 18 }; // 为什么不用写 name: name?
```

如果你能理解这些，说明你已经准备好学习 React 了！🎉

## 📚 下一步

完成这个项目后，你可以：
1. 尝试添加更多功能（编辑、本地存储、分类等）
2. 重构代码，提取函数，提高代码质量
3. 开始学习 React，你会发现很多概念都很相似！

