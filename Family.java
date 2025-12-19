package com.wardmanagement.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "families")
public class Family {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String familyName;
    
    @Column(nullable = false)
    private Integer zone; // 1-5
    
    @Column(nullable = false)
    private Integer houseNumber;
    
    @Column(nullable = false)
    private String houseOwnership; // "OWNED" or "RENTAL"
    
    @Column(nullable = false)
    private String address;
    
    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FamilyMember> members = new ArrayList<>();
    
    // Constructors
    public Family() {}
    
    public Family(String familyName, Integer zone, Integer houseNumber, String houseOwnership, String address) {
        this.familyName = familyName;
        this.zone = zone;
        this.houseNumber = houseNumber;
        this.houseOwnership = houseOwnership;
        this.address = address;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFamilyName() {
        return familyName;
    }
    
    public void setFamilyName(String familyName) {
        this.familyName = familyName;
    }
    
    public Integer getZone() {
        return zone;
    }
    
    public void setZone(Integer zone) {
        this.zone = zone;
    }
    
    public Integer getHouseNumber() {
        return houseNumber;
    }
    
    public void setHouseNumber(Integer houseNumber) {
        this.houseNumber = houseNumber;
    }
    
    public String getHouseOwnership() {
        return houseOwnership;
    }
    
    public void setHouseOwnership(String houseOwnership) {
        this.houseOwnership = houseOwnership;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public List<FamilyMember> getMembers() {
        return members;
    }
    
    public void setMembers(List<FamilyMember> members) {
        this.members = members;
    }
}