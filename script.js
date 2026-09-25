// Lấy các phần tử từ DOM
const namesListInput = document.getElementById('namesList');
const numberInput = document.getElementById('numberInput');
const numberLabel = document.getElementById('numberLabel');
const generateBtn = document.getElementById('generateBtn');
const resultsContainer = document.getElementById('results');
const radioButtons = document.getElementsByName('splitType');
const saveBtn = document.getElementById('saveBtn');
const exportBtn = document.getElementById('exportBtn');
const saveStatus = document.getElementById('saveStatus');
const savedGroupsKey = 'randomGroups:lastSaved';
let currentGroups = [];
let isCurrentGroupsSaved = false;

function updateActionButtons() {
    const hasGroups = currentGroups.length > 0;
    saveBtn.disabled = !hasGroups || isCurrentGroupsSaved;
    exportBtn.disabled = !hasGroups;
}

function saveGroups() {
    if (currentGroups.length === 0) {
        return;
    }

    const savedData = {
        createdAt: new Date().toISOString(),
        groups: currentGroups
    };
    localStorage.setItem(savedGroupsKey, JSON.stringify(savedData));
    isCurrentGroupsSaved = true;
    saveStatus.textContent = `Đã lưu lúc ${new Date(savedData.createdAt).toLocaleTimeString('vi-VN')}`;
    updateActionButtons();
}

function exportGroupsToExcel() {
    if (currentGroups.length === 0 || typeof XLSX === 'undefined') {
        alert('Không thể xuất Excel khi chưa có nhóm hoặc thư viện Excel chưa sẵn sàng.');
        return;
    }

    const rows = [];
    currentGroups.forEach((group, groupIndex) => {
        group.forEach((student, studentIndex) => {
            rows.push({
                'Nhóm': `Nhóm ${groupIndex + 1}`,
                'STT': studentIndex + 1,
                'Họ và tên': student
            });
        });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 14 }, { wch: 8 }, { wch: 32 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách nhóm');
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `danh-sach-nhom-${date}.xlsx`);
}

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
    currentGroups = groups;
    isCurrentGroupsSaved = false;
    saveStatus.textContent = 'Nhóm mới đã tạo, hãy lưu trước khi rời trang';
    updateActionButtons();

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

saveBtn.addEventListener('click', saveGroups);
exportBtn.addEventListener('click', exportGroupsToExcel);

const lastSavedGroups = localStorage.getItem(savedGroupsKey);
if (lastSavedGroups) {
    try {
        const savedData = JSON.parse(lastSavedGroups);
        const savedDate = new Date(savedData.createdAt);
        if (Array.isArray(savedData.groups) && savedData.groups.length > 0 && !isNaN(savedDate)) {
            saveStatus.textContent = `Lần lưu gần nhất: ${savedDate.toLocaleString('vi-VN')}`;
        }
    } catch (error) {
        localStorage.removeItem(savedGroupsKey);
    }
}