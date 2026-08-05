// Lấy các phần tử từ DOM
const namesListInput = document.getElementById('namesList');
const numberInput = document.getElementById('numberInput');
const numberLabel = document.getElementById('numberLabel');
const generateBtn = document.getElementById('generateBtn');
const resultsContainer = document.getElementById('results');
const radioButtons = document.getElementsByName('splitType');

// Cập nhật nhãn (label) khi đổi phương pháp chia
radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if(e.target.value === 'byGroupCount') {
            numberLabel.innerText = "Số lượng nhóm muốn chia:";
        } else {
            numberLabel.innerText = "Số người tối đa trong 1 nhóm:";
        }
    });
});

// Thuật toán xáo trộn mảng ngẫu nhiên (Fisher-Yates)
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Xử lý khi bấm nút "Chia nhóm"
generateBtn.addEventListener('click', () => {
    // Lấy dữ liệu và làm sạch (xóa dòng trống, xóa khoảng trắng thừa)
    const rawText = namesListInput.value;
    const namesArray = rawText.split('\n')
                              .map(name => name.trim())
                              .filter(name => name.length > 0);

    const numberValue = parseInt(numberInput.value);
    const splitType = document.querySelector('input[name="splitType"]:checked').value;

    // Kiểm tra tính hợp lệ
    if (namesArray.length === 0) {
        alert("Vui lòng nhập danh sách học sinh!");
        return;
    }
    if (isNaN(numberValue) || numberValue < 1) {
        alert("Vui lòng nhập số hợp lệ lớn hơn 0!");
        return;
    }
    if (splitType === 'byGroupCount' && numberValue > namesArray.length) {
        alert("Số nhóm không thể lớn hơn tổng số học sinh!");
        return;
    }

    // Xáo trộn danh sách
    const shuffledNames = shuffleArray([...namesArray]);
    const groups = [];

    // Thuật toán chia nhóm
    if (splitType === 'byGroupCount') {
        // Chia đều cho N nhóm (nhóm đầu có thể dư 1 người)
        const numGroups = numberValue;
        for (let i = 0; i < numGroups; i++) {
            groups.push([]);
        }
        shuffledNames.forEach((name, index) => {
            const groupIndex = index % numGroups;
            groups[groupIndex].push(name);
        });
    } else {
        // Chia theo số lượng người mỗi nhóm
        const studentsPerGroup = numberValue;
        for (let i = 0; i < shuffledNames.length; i += studentsPerGroup) {
            groups.push(shuffledNames.slice(i, i + studentsPerGroup));
        }
    }

    // Xóa kết quả cũ và hiển thị kết quả mới
    resultsContainer.innerHTML = '';

    groups.forEach((group, index) => {
        // Tạo giao diện cho từng nhóm
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        // Tạo delay animation để các card hiện ra lần lượt đẹp mắt hơn
        groupCard.style.animationDelay = `${index * 0.1}s`; 

        const header = document.createElement('div');
        header.className = 'group-header';
        header.innerText = `Nhóm ${index + 1} (${group.length})`;
        groupCard.appendChild(header);

        const list = document.createElement('ul');
        list.className = 'group-list';
        
        group.forEach(student => {
            const listItem = document.createElement('li');
            listItem.innerText = student;
            list.appendChild(listItem);
        });

        groupCard.appendChild(list);
        resultsContainer.appendChild(groupCard);
    });
});