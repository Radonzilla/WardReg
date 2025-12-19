package com.wardmanagement.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "family_members")
public class FamilyMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false)
    @JsonIgnore
    private Family family;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private LocalDate dateOfBirth;
    
    @Column(nullable = false)
    private String relation; // Father, Mother, Son, Daughter, etc.
    
    @Column(nullable = false)
    private String phoneNumber;
    
    private String occupation;
    
    @Column(nullable = false)
    private Boolean isStudent = false;
    
    @Column(nullable = false)
    private Boolean isSeniorCitizen = false;
    
    @Column(nullable = false)
    private Boolean isDisabled = false;
    
    @Column(nullable = false)
    private Boolean isPensioner = false;
    
    @Column(length = 500)
    private String pensionType; // Old Age, Widow, Disability, etc.
    
    @Column(length = 1000)
    private String medicalNeeds;
    
    // Constructors
    public FamilyMember() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Family getFamily() {
        return family;
    }
    
    public void setFamily(Family family) {
        this.family = family;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getRelation() {
        return relation;
    }
    
    public void setRelation(String relation) {
        this.relation = relation;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getOccupation() {
        return occupation;
    }
    
    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }
    
    public Boolean getIsStudent() {
        return isStudent;
    }
    
    public void setIsStudent(Boolean isStudent) {
        this.isStudent = isStudent;
    }
    
    public Boolean getIsSeniorCitizen() {
        return isSeniorCitizen;
    }
    
    public void setIsSeniorCitizen(Boolean isSeniorCitizen) {
        this.isSeniorCitizen = isSeniorCitizen;
    }
    
    public Boolean getIsDisabled() {
        return isDisabled;
    }
    
    public void setIsDisabled(Boolean isDisabled) {
        this.isDisabled = isDisabled;
    }
    
    public String getMedicalNeeds() {
        return medicalNeeds;
    }
    
    public void setMedicalNeeds(String medicalNeeds) {
        this.medicalNeeds = medicalNeeds;
    }
    
    public Boolean getIsPensioner() {
        return isPensioner;
    }
    
    public void setIsPensioner(Boolean isPensioner) {
        this.isPensioner = isPensioner;
    }
    
    public String getPensionType() {
        return pensionType;
    }
    
    public void setPensionType(String pensionType) {
        this.pensionType = pensionType;
    }
}