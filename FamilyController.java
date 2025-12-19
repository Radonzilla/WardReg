package com.wardmanagement.controller;

import com.wardmanagement.model.Family;
import com.wardmanagement.model.FamilyMember;
import com.wardmanagement.repository.FamilyRepository;
import com.wardmanagement.repository.FamilyMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/families")
@CrossOrigin(origins = "*")
public class FamilyController {

    @Autowired
    private FamilyRepository familyRepository;
    
    @Autowired
    private FamilyMemberRepository memberRepository;

    @GetMapping
    public List<Family> getAllFamilies() {
        return familyRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Family> getFamilyById(@PathVariable Long id) {
        return familyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/zone/{zone}")
    public List<Family> getFamiliesByZone(@PathVariable Integer zone) {
        return familyRepository.findByZone(zone);
    }

    @GetMapping("/search")
    public List<Family> searchFamilies(@RequestParam String name) {
        return familyRepository.findByFamilyNameContainingIgnoreCase(name);
    }

    @PostMapping
    public Family createFamily(@RequestBody Family family) {
        return familyRepository.save(family);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Family> updateFamily(@PathVariable Long id, @RequestBody Family familyDetails) {
        return familyRepository.findById(id)
                .map(family -> {
                    family.setFamilyName(familyDetails.getFamilyName());
                    family.setZone(familyDetails.getZone());
                    family.setHouseNumber(familyDetails.getHouseNumber());
                    family.setHouseOwnership(familyDetails.getHouseOwnership());
                    family.setAddress(familyDetails.getAddress());
                    return ResponseEntity.ok(familyRepository.save(family));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFamily(@PathVariable Long id) {
        return familyRepository.findById(id)
                .map(family -> {
                    familyRepository.delete(family);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{familyId}/members")
    public ResponseEntity<FamilyMember> addMember(@PathVariable Long familyId, @RequestBody FamilyMember member) {
        return familyRepository.findById(familyId)
                .map(family -> {
                    member.setFamily(family);
                    FamilyMember savedMember = memberRepository.save(member);
                    return ResponseEntity.ok(savedMember);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{familyId}/members")
    public ResponseEntity<List<FamilyMember>> getFamilyMembers(@PathVariable Long familyId) {
        return familyRepository.findById(familyId)
                .map(family -> ResponseEntity.ok(family.getMembers()))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        long totalFamilies = familyRepository.count();
        long totalMembers = memberRepository.count();
        long disabledCount = memberRepository.findByIsDisabledTrue().size();
        long seniorCount = memberRepository.findByIsSeniorCitizenTrue().size();
        long studentCount = memberRepository.findByIsStudentTrue().size();
        
        Map<String, Object> stats = Map.of(
            "totalFamilies", totalFamilies,
            "totalMembers", totalMembers,
            "disabledMembers", disabledCount,
            "seniorCitizens", seniorCount,
            "students", studentCount
        );
        
        return ResponseEntity.ok(stats);
    }
}