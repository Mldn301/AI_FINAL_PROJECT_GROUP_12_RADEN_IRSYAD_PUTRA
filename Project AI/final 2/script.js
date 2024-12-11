const patients = [];
const clusterCount = 2;

document.getElementById("patientForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const age = parseInt(document.getElementById("age").value);
    const city = document.getElementById("city").value.toLowerCase();
    const symptoms = document.getElementById("symptoms").value.toLowerCase().split(',');

    patients.push({ name, age, city, symptoms });
    displayPatients();
    clusterPatients();
});

function displayPatients() {
    const tableBody = document.getElementById("patientTable").querySelector("tbody");
    tableBody.innerHTML = "";
    patients.forEach(patient => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.city}</td>
            <td>${patient.symptoms.join(', ')}</td>
        `;
        tableBody.appendChild(row);
    });
}

function clusterPatients() {
    if (patients.length < clusterCount) return;

    const uniqueCities = [...new Set(patients.map(p => p.city))];
    const allSymptoms = [...new Set(patients.flatMap(p => p.symptoms))];

    const data = patients.map(p => ({
        name: p.name,
        vector: [
            p.age,
            uniqueCities.indexOf(p.city),
            ...allSymptoms.map(symptom => p.symptoms.includes(symptom) ? 1 : 0)
        ]
    }));

    const clusters = kMeans(data, clusterCount);

    displayClusters(clusters);
}


function kMeans(data, k) {
    const centroids = data.slice(0, k).map(p => p.vector); 
    let assignments = new Array(data.length).fill(-1);
    let isChanged;
    do {
        isChanged = false;
        data.forEach((point, i) => {
            const distances = centroids.map(c => euclideanDistance(c, point.vector));
            const newAssignment = distances.indexOf(Math.min(...distances));
            if (newAssignment !== assignments[i]) {
                assignments[i] = newAssignment;
                isChanged = true;
            }
        });
        centroids.forEach((_, clusterIdx) => {
            const clusterPoints = data.filter((_, i) => assignments[i] === clusterIdx);
            if (clusterPoints.length > 0) {
                centroids[clusterIdx] = clusterPoints[0].vector.map((_, dimIdx) =>
                    clusterPoints.reduce((sum, p) => sum + p.vector[dimIdx], 0) / clusterPoints.length
                );
            }
        });
    } while (isChanged);
    return centroids.map((_, clusterIdx) => ({
        centroid: centroids[clusterIdx],
        members: data.filter((_, i) => assignments[i] === clusterIdx)
    }));
}

function euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, idx) => sum + Math.pow(val - b[idx], 2), 0));
}

function displayClusters(clusters) {
    const clusterDiv = document.getElementById("clusters");
    clusterDiv.innerHTML = "";

    clusters.forEach((cluster, idx) => {
        const clusterEl = document.createElement("div");
        clusterEl.innerHTML = `
            <h3>Cluster ${idx + 1}</h3>
            <ul>
                ${cluster.members.map(m => `<li>${m.name}</li>`).join('')}
            </ul>
        `;
        clusterDiv.appendChild(clusterEl);
    });
}
