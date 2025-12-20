// Firebase Ward Management System
// Make sure Firebase is initialized in your HTML before this script

// Get Firestore instance (initialized in HTML)
// const db = firebase.firestore();

// Collections
const FAMILIES_COLLECTION = 'families';
const MEMBERS_COLLECTION = 'members';
const REQUESTS_COLLECTION = 'requests';

// State Management
let currentSection = 'dashboard';
let familiesData = [];
let membersData = [];
let requestsData = [];
let currentZoneFilter = '';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeModals();
    initializeForms();
    initializeEventListeners();
    // Don't load data here - wait for authentication
    // Data will be loaded by auth.js after user is authenticated
});

// Navigation
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(section) {
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });

    // Update active section
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === section);
    });

    currentSection = section;

    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'families':
            loadFamilies(currentZoneFilter); // Load families when navigating to this section
            break;
        case 'members':
            loadMembers(); // Load members when navigating to this section
            break;
        case 'queries':
            // Queries are loaded on-demand via buttons
            break;
        case 'requests':
            loadRequests();
            break;
    }
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        const [familiesSnapshot, membersSnapshot] = await Promise.all([
            db.collection(FAMILIES_COLLECTION).get(),
            db.collection(MEMBERS_COLLECTION).get()
        ]);

        const totalFamilies = familiesSnapshot.size;
        const allMembers = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const disabledMembers = allMembers.filter(m => m.isDisabled).length;
        const seniorCitizens = allMembers.filter(m => m.isSeniorCitizen).length;
        const students = allMembers.filter(m => m.isStudent).length;
        const pensioners = allMembers.filter(m => m.isPensioner).length;

        document.getElementById('totalFamilies').textContent = totalFamilies;
        document.getElementById('totalMembers').textContent = allMembers.length;
        document.getElementById('disabledMembers').textContent = disabledMembers;
        document.getElementById('seniorCitizens').textContent = seniorCitizens;
        document.getElementById('students').textContent = students;
        document.getElementById('pensioners').textContent = pensioners;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Family Functions
async function loadFamilies(zoneFilter = '') {
    try {
        let query = db.collection(FAMILIES_COLLECTION).orderBy('familyName');
        
        if (zoneFilter) {
            query = query.where('zone', '==', parseInt(zoneFilter));
        }

        const snapshot = await query.get();
        
        familiesData = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const familyData = { id: doc.id, ...doc.data() };
                
                // Get members for this family
                const membersSnapshot = await db.collection(MEMBERS_COLLECTION)
                    .where('familyId', '==', doc.id)
                    .get();
                
                familyData.members = membersSnapshot.docs.map(memberDoc => ({
                    id: memberDoc.id,
                    ...memberDoc.data()
                }));
                
                return familyData;
            })
        );

        displayFamilies(familiesData);
    } catch (error) {
        console.error('Error loading families:', error);
        showNotification('Failed to load families', 'error');
    }
}

function displayFamilies(families) {
    const container = document.getElementById('familiesList');
    
    if (families.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏠</div>
                <h3>No Families Found</h3>
                <p>Start by adding a new family to the system</p>
            </div>
        `;
        return;
    }

    container.innerHTML = families.map(family => `
        <div class="data-card" data-family-id="${family.id}">
            <div class="data-card-header">
                <div>
                    <h3 class="data-card-title">${family.familyName}</h3>
                    <p class="data-card-subtitle">Zone ${family.zone} • House #${family.houseNumber}</p>
                </div>
                <div class="data-card-actions">
                    <button class="btn-icon" onclick="addMemberToFamily('${family.id}')" title="Add Member">➕</button>
                    <button class="btn-icon" onclick="editFamily('${family.id}')" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="deleteFamily('${family.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="data-card-body">
                <div class="data-field">
                    <strong>Address</strong>
                    ${family.address}
                </div>
                <div class="data-field">
                    <strong>Ownership</strong>
                    <span class="badge ${family.houseOwnership === 'OWNED' ? 'badge-owned' : 'badge-rental'}">
                        ${family.houseOwnership}
                    </span>
                </div>
                <div class="data-field">
                    <strong>Members</strong>
                    ${family.members ? family.members.length : 0}
                </div>
            </div>
            ${family.members && family.members.length > 0 ? `
                <div class="members-grid">
                    ${family.members.map(member => `
                        <div class="member-item">
                            <div class="member-info">
                                <div class="member-name">${member.name}</div>
                                <div class="member-details">
                                    ${member.relation} • ${member.phoneNumber}
                                    ${member.occupation ? ` • ${member.occupation}` : ''}
                                </div>
                            </div>
                            <div class="member-tags">
                                ${member.isStudent ? '<span class="badge badge-yes">Student</span>' : ''}
                                ${member.isSeniorCitizen ? '<span class="badge badge-yes">Senior</span>' : ''}
                                ${member.isDisabled ? '<span class="badge badge-yes">Disabled</span>' : ''}
                                ${member.isPensioner ? '<span class="badge badge-yes">Pensioner</span>' : ''}
                            </div>
                            <div class="data-card-actions">
                                <button class="btn-icon" onclick="editMember('${member.id}')" title="Edit">✏️</button>
                                <button class="btn-icon" onclick="deleteMember('${member.id}')" title="Delete">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Member Functions
async function loadMembers(searchQuery = '') {
    try {
        let query = db.collection(MEMBERS_COLLECTION).orderBy('name');
        const snapshot = await query.get();
        
        membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side filtering for search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            membersData = membersData.filter(member => 
                member.name.toLowerCase().includes(lowerQuery) ||
                member.phoneNumber.includes(searchQuery)
            );
        }

        displayMembers(membersData);
    } catch (error) {
        console.error('Error loading members:', error);
        showNotification('Failed to load members', 'error');
    }
}

function displayMembers(members) {
    const container = document.getElementById('membersList');
    
    if (members.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👤</div>
                <h3>No Members Found</h3>
                <p>Add members through family records</p>
            </div>
        `;
        return;
    }

    container.innerHTML = members.map(member => {
        const age = calculateAge(member.dateOfBirth);
        return `
            <div class="data-card">
                <div class="data-card-header">
                    <div>
                        <h3 class="data-card-title">${member.name}</h3>
                        <p class="data-card-subtitle">${member.relation} • Age ${age}</p>
                    </div>
                    <div class="data-card-actions">
                        <button class="btn-icon" onclick="editMember('${member.id}')" title="Edit">✏️</button>
                        <button class="btn-icon" onclick="deleteMember('${member.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="data-card-body">
                    <div class="data-field">
                        <strong>Phone</strong>
                        ${member.phoneNumber}
                    </div>
                    <div class="data-field">
                        <strong>DOB</strong>
                        ${formatDate(member.dateOfBirth)}
                    </div>
                    <div class="data-field">
                        <strong>Occupation</strong>
                        ${member.occupation || 'Not specified'}
                    </div>
                    <div class="data-field">
                        <strong>Categories</strong>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem;">
                            ${member.isStudent ? '<span class="badge badge-yes">Student</span>' : ''}
                            ${member.isSeniorCitizen ? '<span class="badge badge-yes">Senior</span>' : ''}
                            ${member.isDisabled ? '<span class="badge badge-yes">Disabled</span>' : ''}
                            ${member.isPensioner ? '<span class="badge badge-yes">Pensioner</span>' : ''}
                        </div>
                    </div>
                </div>
                ${member.pensionType ? `
                    <div class="data-field" style="margin-top: 1rem;">
                        <strong>Pension Type</strong>
                        ${member.pensionType}
                    </div>
                ` : ''}
                ${member.medicalNeeds ? `
                    <div class="data-field" style="margin-top: 1rem;">
                        <strong>Medical Needs</strong>
                        ${member.medicalNeeds}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Query Functions
async function runQuery(type) {
    try {
        const snapshot = await db.collection(MEMBERS_COLLECTION).get();
        const allMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        let filteredMembers = [];
        switch(type) {
            case 'disabled':
                filteredMembers = allMembers.filter(m => m.isDisabled);
                break;
            case 'seniors':
                filteredMembers = allMembers.filter(m => m.isSeniorCitizen);
                break;
            case 'students':
                filteredMembers = allMembers.filter(m => m.isStudent);
                break;
            case 'pensioners':
                filteredMembers = allMembers.filter(m => m.isPensioner);
                break;
        }
        
        displayQueryResults(filteredMembers, type);
    } catch (error) {
        console.error('Error running query:', error);
        showNotification('Failed to run query', 'error');
    }
}

async function runCustomQuery(occupation) {
    try {
        const snapshot = await db.collection(MEMBERS_COLLECTION).get();
        const allMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const filteredMembers = allMembers.filter(m => 
            m.occupation && m.occupation.toLowerCase().includes(occupation.toLowerCase())
        );
        
        displayQueryResults(filteredMembers, 'custom', occupation);
    } catch (error) {
        console.error('Error running custom query:', error);
        showNotification('Failed to run query', 'error');
    }
}

function displayQueryResults(members, type, customLabel = '') {
    const container = document.getElementById('queryResults');
    
    let title = '';
    switch(type) {
        case 'disabled':
            title = 'Disabled Members';
            break;
        case 'seniors':
            title = 'Senior Citizens (60+ years)';
            break;
        case 'students':
            title = 'Students';
            break;
        case 'pensioners':
            title = 'Pensioners';
            break;
        case 'custom':
            title = `Members with occupation: ${customLabel}`;
            break;
    }
    
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.5rem; color: var(--primary-dark); margin-bottom: 0.5rem;">${title}</h3>
            <p style="color: var(--text-secondary);">Found ${members.length} member(s)</p>
        </div>
        ${members.length === 0 ? `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No Results Found</h3>
                <p>No members match this criteria</p>
            </div>
        ` : `
            <div class="data-list">
                ${members.map(member => {
                    const age = calculateAge(member.dateOfBirth);
                    return `
                        <div class="data-card">
                            <div class="data-card-header">
                                <div>
                                    <h3 class="data-card-title">${member.name}</h3>
                                    <p class="data-card-subtitle">${member.relation} • Age ${age}</p>
                                </div>
                            </div>
                            <div class="data-card-body">
                                <div class="data-field">
                                    <strong>Phone</strong>
                                    ${member.phoneNumber}
                                </div>
                                <div class="data-field">
                                    <strong>Occupation</strong>
                                    ${member.occupation || 'Not specified'}
                                </div>
                                ${member.isPensioner && member.pensionType ? `
                                    <div class="data-field">
                                        <strong>Pension Type</strong>
                                        ${member.pensionType}
                                    </div>
                                ` : ''}
                                ${member.medicalNeeds ? `
                                    <div class="data-field">
                                        <strong>Medical Needs</strong>
                                        ${member.medicalNeeds}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `}
    `;
}

// Request Functions
async function loadRequests(statusFilter = '') {
    try {
        let query = db.collection(REQUESTS_COLLECTION).orderBy('requestDate', 'desc');
        
        if (statusFilter) {
            query = query.where('status', '==', statusFilter);
        }

        const snapshot = await query.get();
        requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        displayRequests(requestsData);
    } catch (error) {
        console.error('Error loading requests:', error);
        showNotification('Failed to load requests', 'error');
    }
}

function displayRequests(requests) {
    const container = document.getElementById('requestsList');
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>No Requests Found</h3>
                <p>No requests match the selected filter</p>
            </div>
        `;
        return;
    }

    container.innerHTML = requests.map(request => `
        <div class="request-card">
            <div class="request-header">
                <div>
                    <div class="request-person">${request.memberName}</div>
                    <div class="request-date">${formatDateTime(request.requestDate)}</div>
                </div>
                <span class="badge badge-${request.status.toLowerCase()}">${request.status}</span>
            </div>
            <div class="request-description">
                ${request.requestDescription}
            </div>
            ${request.notes ? `
                <div class="data-field">
                    <strong>Notes</strong>
                    ${request.notes}
                </div>
            ` : ''}
            <div class="request-actions">
                ${request.status === 'PENDING' ? `
                    <button class="btn-small btn-progress" onclick="updateRequestStatus('${request.id}', 'IN_PROGRESS')">
                        Start Progress
                    </button>
                    <button class="btn-small btn-approve" onclick="updateRequestStatus('${request.id}', 'COMPLETED')">
                        Complete
                    </button>
                    <button class="btn-small btn-reject" onclick="updateRequestStatus('${request.id}', 'REJECTED')">
                        Reject
                    </button>
                ` : ''}
                ${request.status === 'IN_PROGRESS' ? `
                    <button class="btn-small btn-approve" onclick="updateRequestStatus('${request.id}', 'COMPLETED')">
                        Complete
                    </button>
                ` : ''}
                <button class="btn-small btn-secondary" onclick="deleteRequest('${request.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function updateRequestStatus(requestId, newStatus) {
    const notes = prompt('Add notes (optional):');
    try {
        const updateData = { 
            status: newStatus,
            notes: notes || ''
        };
        
        if (newStatus === 'COMPLETED' || newStatus === 'REJECTED') {
            updateData.completedDate = firebase.firestore.Timestamp.now();
        }

        await db.collection(REQUESTS_COLLECTION).doc(requestId).update(updateData);
        
        showNotification('Request status updated successfully', 'success');
        loadRequests();
    } catch (error) {
        console.error('Error updating request:', error);
        showNotification('Failed to update request status', 'error');
    }
}

// Modal Management
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => closeModal(modal.id));
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    const form = modal.querySelector('form');
    if (form) form.reset();
}

// Form Handlers
function initializeForms() {
    document.getElementById('familyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveFamilyForm();
    });

    document.getElementById('memberForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveMemberForm();
    });

    document.getElementById('requestForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveRequestForm();
    });
}

async function saveFamilyForm() {
    const familyId = document.getElementById('familyId').value;
    const familyData = {
        familyName: document.getElementById('familyName').value,
        zone: parseInt(document.getElementById('familyZone').value),
        houseNumber: parseInt(document.getElementById('houseNumber').value),
        houseOwnership: document.getElementById('houseOwnership').value,
        address: document.getElementById('familyAddress').value,
        updatedAt: firebase.firestore.Timestamp.now()
    };

    try {
        if (familyId) {
            await db.collection(FAMILIES_COLLECTION).doc(familyId).update(familyData);
        } else {
            familyData.createdAt = firebase.firestore.Timestamp.now();
            await db.collection(FAMILIES_COLLECTION).add(familyData);
        }

        showNotification('Family saved successfully', 'success');
        closeModal('familyModal');
        loadFamilies();
        loadDashboardData();
    } catch (error) {
        console.error('Error saving family:', error);
        showNotification('Failed to save family', 'error');
    }
}

async function saveMemberForm() {
    const memberId = document.getElementById('memberId').value;
    const familyId = document.getElementById('memberFamilyId').value;
    
    const memberData = {
        familyId: familyId,
        name: document.getElementById('memberName').value,
        dateOfBirth: document.getElementById('memberDob').value,
        relation: document.getElementById('memberRelation').value,
        phoneNumber: document.getElementById('memberPhone').value,
        occupation: document.getElementById('memberOccupation').value,
        isStudent: document.getElementById('memberIsStudent').checked,
        isSeniorCitizen: document.getElementById('memberIsSenior').checked,
        isDisabled: document.getElementById('memberIsDisabled').checked,
        isPensioner: document.getElementById('memberIsPensioner').checked,
        pensionType: document.getElementById('memberPensionType').value,
        medicalNeeds: document.getElementById('memberMedical').value,
        updatedAt: firebase.firestore.Timestamp.now()
    };

    try {
        if (memberId) {
            await db.collection(MEMBERS_COLLECTION).doc(memberId).update(memberData);
        } else {
            memberData.createdAt = firebase.firestore.Timestamp.now();
            await db.collection(MEMBERS_COLLECTION).add(memberData);
        }

        showNotification('Member saved successfully', 'success');
        closeModal('memberModal');
        loadFamilies();
        loadDashboardData();
    } catch (error) {
        console.error('Error saving member:', error);
        showNotification('Failed to save member', 'error');
    }
}

async function saveRequestForm() {
    const memberId = document.getElementById('selectedMemberId').value;
    const memberName = document.getElementById('selectedPersonInfo').textContent.split('(')[0].replace('Selected:', '').trim();
    const memberPhone = document.getElementById('selectedPersonInfo').textContent.match(/\((.*?)\)/)?.[1] || '';
    const description = document.getElementById('requestDescription').value;
    
    if (!memberId) {
        showNotification('Please select a person', 'error');
        return;
    }

    try {
        await db.collection(REQUESTS_COLLECTION).add({
            memberId: memberId,
            memberName: memberName,
            memberPhone: memberPhone,
            requestDescription: description,
            status: 'PENDING',
            notes: '',
            requestDate: firebase.firestore.Timestamp.now(),
            completedDate: null
        });

        showNotification('Request added successfully', 'success');
        closeModal('requestModal');
        loadRequests();
    } catch (error) {
        console.error('Error saving request:', error);
        showNotification('Failed to save request', 'error');
    }
}

// CRUD Operations
function addMemberToFamily(familyId) {
    document.getElementById('memberModalTitle').textContent = 'Add Family Member';
    document.getElementById('memberId').value = '';
    document.getElementById('memberFamilyId').value = familyId;
    document.getElementById('memberForm').reset();
    openModal('memberModal');
}

async function editFamily(familyId) {
    try {
        const doc = await db.collection(FAMILIES_COLLECTION).doc(familyId).get();
        const family = { id: doc.id, ...doc.data() };
        
        document.getElementById('familyModalTitle').textContent = 'Edit Family';
        document.getElementById('familyId').value = family.id;
        document.getElementById('familyName').value = family.familyName;
        document.getElementById('familyZone').value = family.zone;
        document.getElementById('houseNumber').value = family.houseNumber;
        document.getElementById('houseOwnership').value = family.houseOwnership;
        document.getElementById('familyAddress').value = family.address;
        
        openModal('familyModal');
    } catch (error) {
        console.error('Error loading family:', error);
        showNotification('Failed to load family data', 'error');
    }
}

async function deleteFamily(familyId) {
    if (!confirm('Are you sure you want to delete this family? All members will also be deleted.')) {
        return;
    }

    try {
        // Delete all members first
        const membersSnapshot = await db.collection(MEMBERS_COLLECTION)
            .where('familyId', '==', familyId)
            .get();
        
        const batch = db.batch();
        membersSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Delete family
        batch.delete(db.collection(FAMILIES_COLLECTION).doc(familyId));
        
        await batch.commit();

        showNotification('Family deleted successfully', 'success');
        loadFamilies();
        loadDashboardData();
    } catch (error) {
        console.error('Error deleting family:', error);
        showNotification('Failed to delete family', 'error');
    }
}

async function editMember(memberId) {
    try {
        const doc = await db.collection(MEMBERS_COLLECTION).doc(memberId).get();
        const member = { id: doc.id, ...doc.data() };
        
        document.getElementById('memberModalTitle').textContent = 'Edit Member';
        document.getElementById('memberId').value = member.id;
        document.getElementById('memberFamilyId').value = member.familyId;
        document.getElementById('memberName').value = member.name;
        document.getElementById('memberDob').value = member.dateOfBirth;
        document.getElementById('memberRelation').value = member.relation;
        document.getElementById('memberPhone').value = member.phoneNumber;
        document.getElementById('memberOccupation').value = member.occupation || '';
        document.getElementById('memberIsStudent').checked = member.isStudent;
        document.getElementById('memberIsSenior').checked = member.isSeniorCitizen;
        document.getElementById('memberIsDisabled').checked = member.isDisabled;
        document.getElementById('memberIsPensioner').checked = member.isPensioner;
        document.getElementById('memberPensionType').value = member.pensionType || '';
        document.getElementById('memberMedical').value = member.medicalNeeds || '';
        
        // Show/hide pension type based on checkbox
        if (member.isPensioner) {
            document.getElementById('pensionTypeGroup').style.display = 'block';
        }
        
        openModal('memberModal');
    } catch (error) {
        console.error('Error loading member:', error);
        showNotification('Failed to load member data', 'error');
    }
}

async function deleteMember(memberId) {
    if (!confirm('Are you sure you want to delete this member?')) {
        return;
    }

    try {
        await db.collection(MEMBERS_COLLECTION).doc(memberId).delete();

        showNotification('Member deleted successfully', 'success');
        loadFamilies();
        loadDashboardData();
    } catch (error) {
        console.error('Error deleting member:', error);
        showNotification('Failed to delete member', 'error');
    }
}

async function deleteRequest(requestId) {
    if (!confirm('Are you sure you want to delete this request?')) {
        return;
    }

    try {
        await db.collection(REQUESTS_COLLECTION).doc(requestId).delete();

        showNotification('Request deleted successfully', 'success');
        loadRequests();
    } catch (error) {
        console.error('Error deleting request:', error);
        showNotification('Failed to delete request', 'error');
    }
}

// Event Listeners
function initializeEventListeners() {
    document.getElementById('addFamilyBtn').addEventListener('click', () => {
        document.getElementById('familyModalTitle').textContent = 'Add New Family';
        document.getElementById('familyId').value = '';
        document.getElementById('familyForm').reset();
        openModal('familyModal');
    });

    document.getElementById('cancelFamilyBtn').addEventListener('click', () => {
        closeModal('familyModal');
    });

    document.getElementById('cancelMemberBtn').addEventListener('click', () => {
        closeModal('memberModal');
    });

    document.getElementById('cancelRequestBtn').addEventListener('click', () => {
        closeModal('requestModal');
    });

    document.getElementById('familySearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = familiesData.filter(family => 
            family.familyName.toLowerCase().includes(query)
        );
        displayFamilies(filtered);
    });

    document.getElementById('memberSearch').addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length >= 2) {
            loadMembers(query);
        } else if (query.length === 0) {
            loadMembers();
        }
    });

    document.querySelectorAll('.btn-query').forEach(btn => {
        btn.addEventListener('click', () => {
            const queryType = btn.dataset.query;
            if (queryType) {
                runQuery(queryType);
            }
        });
    });

    document.getElementById('customQueryBtn').addEventListener('click', () => {
        const occupation = prompt('Enter occupation to search for (e.g., Teacher, Farmer, Doctor):');
        if (occupation) {
            runCustomQuery(occupation);
        }
    });

    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const status = tab.dataset.status;
            loadRequests(status);
        });
    });

    document.getElementById('addRequestBtn').addEventListener('click', () => {
        document.getElementById('requestForm').reset();
        document.getElementById('selectedMemberId').value = '';
        document.getElementById('selectedPersonInfo').classList.remove('active');
        document.getElementById('personSearchResults').classList.remove('active');
        openModal('requestModal');
    });

    let searchTimeout;
    document.getElementById('requestPersonSearch').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value;
        
        if (query.length >= 2) {
            searchTimeout = setTimeout(() => searchPersonForRequest(query), 300);
        } else {
            document.getElementById('personSearchResults').classList.remove('active');
        }
    });

    document.getElementById('globalZoneFilter').addEventListener('change', (e) => {
        const zone = e.target.value;
        currentZoneFilter = zone;
        if (currentSection === 'families') {
            loadFamilies(zone);
        }
    });

    // Show/hide pension type dropdown
    document.getElementById('memberIsPensioner').addEventListener('change', (e) => {
        const pensionTypeGroup = document.getElementById('pensionTypeGroup');
        if (e.target.checked) {
            pensionTypeGroup.style.display = 'block';
        } else {
            pensionTypeGroup.style.display = 'none';
            document.getElementById('memberPensionType').value = '';
        }
    });
}

async function searchPersonForRequest(query) {
    try {
        const snapshot = await db.collection(MEMBERS_COLLECTION).get();
        const allMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const lowerQuery = query.toLowerCase();
        const members = allMembers.filter(m => 
            m.name.toLowerCase().includes(lowerQuery) ||
            m.phoneNumber.includes(query)
        );
        
        const resultsContainer = document.getElementById('personSearchResults');
        
        if (members.length === 0) {
            resultsContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">No members found</div>';
        } else {
            resultsContainer.innerHTML = members.map(member => `
                <div class="search-result-item" onclick="selectPersonForRequest('${member.id}', '${member.name}', '${member.phoneNumber}')">
                    <div class="search-result-name">${member.name}</div>
                    <div class="search-result-details">${member.relation} • ${member.phoneNumber}</div>
                </div>
            `).join('');
        }
        
        resultsContainer.classList.add('active');
    } catch (error) {
        console.error('Error searching members:', error);
    }
}

function selectPersonForRequest(memberId, name, phone) {
    document.getElementById('selectedMemberId').value = memberId;
    document.getElementById('requestPersonSearch').value = '';
    document.getElementById('personSearchResults').classList.remove('active');
    
    const selectedInfo = document.getElementById('selectedPersonInfo');
    selectedInfo.textContent = `Selected: ${name} (${phone})`;
    selectedInfo.classList.add('active');
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(timestamp) {
    if (!timestamp) return '';
    
    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else {
        date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
