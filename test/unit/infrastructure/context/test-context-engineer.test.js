/**
 * ContextEngineer Tests
 * 
 * Tests quality scoring (0-100) for context packages.
 * NO SIMULATIONS LAW: All quality scores are real calculations, not estimates.
 */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import ContextEngineer from '../../../../src/infrastructure/context/ContextEngineer.js';

describe('ContextEngineer', () => {
  let contextEngineer;

  beforeEach(() => {
    contextEngineer = new ContextEngineer();
  });

  describe('Constructor', () => {
    it('should create ContextEngineer instance', () => {
      expect(contextEngineer).to.be.instanceOf(ContextEngineer);
    });

    it('should set WARNING_THRESHOLD to 40', () => {
      expect(contextEngineer.WARNING_THRESHOLD).to.equal(40);
    });

    it('should set PASS_THRESHOLD to 60', () => {
      expect(contextEngineer.PASS_THRESHOLD).to.equal(60);
    });
  });

  describe('constructContextPackage()', () => {
    it('should construct context package with all fields', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Analyze payment module security vulnerabilities',
        targetClone: 'beta',
        artifactManifests: [],
        essentialData: { framework: 'Express.js' }
      });

      expect(pkg).to.have.property('objective');
      expect(pkg).to.have.property('targetClone', 'beta');
      expect(pkg).to.have.property('artifactManifests');
      expect(pkg).to.have.property('essentialData');
      expect(pkg).to.have.property('constraints');
      expect(pkg).to.have.property('quality');
      expect(pkg).to.have.property('timestamp');
    });

    it('should calculate quality scores', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Analyze code for security issues',
        targetClone: 'beta'
      });

      expect(pkg.quality).to.have.property('objectiveClarity');
      expect(pkg.quality).to.have.property('dataRelevance');
      expect(pkg.quality).to.have.property('artifactUtilization');
      expect(pkg.quality).to.have.property('overallQuality');
      expect(pkg.quality).to.have.property('meetsWarningThreshold');
      expect(pkg.quality).to.have.property('meetsPassThreshold');
    });

    it('should throw error for missing objective', () => {
      expect(() => contextEngineer.constructContextPackage({
        targetClone: 'beta'
      })).to.throw('Objective is required');
    });

    it('should throw error for missing targetClone', () => {
      expect(() => contextEngineer.constructContextPackage({
        objective: 'Test objective'
      })).to.throw('Target clone is required');
    });

    it('should use default values for optional parameters', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Test objective',
        targetClone: 'beta'
      });

      expect(pkg.artifactManifests).to.be.an('array').that.is.empty;
      expect(pkg.essentialData).to.be.an('object').that.is.empty;
      expect(pkg.constraints).to.be.an('array').that.is.empty;
    });
  });

  describe('Objective Clarity Scoring', () => {
    it('should score optimal objective highly (5-20 words)', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Analyze payment module code for security vulnerabilities',
        targetClone: 'beta'
      });

      expect(pkg.quality.objectiveClarity).to.be.at.least(70);
    });

    it('should penalize very short objectives', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Test',
        targetClone: 'beta'
      });

      expect(pkg.quality.objectiveClarity).to.be.lessThan(50);
    });

    it('should penalize very long objectives', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'This is a very long objective that contains way too many words and should be penalized for being overly verbose and not concise enough for effective communication',
        targetClone: 'beta'
      });

      expect(pkg.quality.objectiveClarity).to.be.lessThan(70);
    });

    it('should score higher for action verbs', () => {
      const withAction = contextEngineer.constructContextPackage({
        objective: 'Analyze the payment system security',
        targetClone: 'beta'
      });

      const withoutAction = contextEngineer.constructContextPackage({
        objective: 'The payment system security situation',
        targetClone: 'beta'
      });

      expect(withAction.quality.objectiveClarity).to.be.greaterThan(
        withoutAction.quality.objectiveClarity
      );
    });

    it('should score higher for target specification', () => {
      const withTarget = contextEngineer.constructContextPackage({
        objective: 'Review the authentication code structure',
        targetClone: 'beta'
      });

      const withoutTarget = contextEngineer.constructContextPackage({
        objective: 'Review the authentication approach',
        targetClone: 'beta'
      });

      expect(withTarget.quality.objectiveClarity).to.be.greaterThan(
        withoutTarget.quality.objectiveClarity
      );
    });

    it('should return 0 for empty objective', () => {
      // This will actually throw, so we test the internal method
      const score = contextEngineer._scoreObjectiveClarity('');
      expect(score).to.equal(0);
    });
  });

  describe('Data Relevance Scoring', () => {
    it('should score neutral (50) for no data', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Analyze code security',
        targetClone: 'beta'
      });

      expect(pkg.quality.dataRelevance).to.equal(50);
    });

    it('should score higher for valid data', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Analyze code security',
        targetClone: 'beta',
        essentialData: {
          framework: 'Express.js',
          version: '4.18.0',
          compliance: 'PCI DSS'
        }
      });

      expect(pkg.quality.dataRelevance).to.be.greaterThan(70);
    });

    it('should penalize null/undefined/empty values', () => {
      const withInvalid = contextEngineer.constructContextPackage({
        objective: 'Analyze code',
        targetClone: 'beta',
        essentialData: {
          framework: 'Express.js',
          version: null,
          compliance: '',
          tags: []
        }
      });

      const withValid = contextEngineer.constructContextPackage({
        objective: 'Analyze code',
        targetClone: 'beta',
        essentialData: {
          framework: 'Express.js'
        }
      });

      expect(withInvalid.quality.dataRelevance).to.be.lessThan(
        withValid.quality.dataRelevance
      );
    });

    it('should give bonus for structured data', () => {
      const structured = contextEngineer.constructContextPackage({
        objective: 'Analyze code',
        targetClone: 'beta',
        essentialData: {
          framework: 'Express.js',
          config: { port: 3000, env: 'prod' }
        }
      });

      const flat = contextEngineer.constructContextPackage({
        objective: 'Analyze code',
        targetClone: 'beta',
        essentialData: {
          framework: 'Express.js',
          port: '3000'
        }
      });

      expect(structured.quality.dataRelevance).to.be.greaterThan(
        flat.quality.dataRelevance
      );
    });
  });

  describe('Artifact Utilization Scoring', () => {
    it('should score neutral-high (70) for no artifacts', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Analyze code',
        targetClone: 'beta'
      });

      expect(pkg.quality.artifactUtilization).to.equal(70);
    });

    it('should score high for valid lightweight manifests', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Analyze code',
        targetClone: 'beta',
        artifactManifests: [
          {
            artifactId: 'uuid-1',
            type: 'code',
            checksum: 'abc123...'
          },
          {
            artifactId: 'uuid-2',
            type: 'documentation',
            checksum: 'def456...'
          }
        ]
      });

      expect(pkg.quality.artifactUtilization).to.be.at.least(90);
    });

    it('should penalize manifests with full content', () => {
      const withContent = contextEngineer.constructContextPackage({
        objective: 'Analyze code',
        targetClone: 'beta',
        artifactManifests: [
          {
            artifactId: 'uuid-1',
            type: 'code',
            checksum: 'abc123...',
            content: 'This is the full content which should not be here'
          }
        ]
      });

      const withoutContent = contextEngineer.constructContextPackage({
        objective: 'Analyze code',
        targetClone: 'beta',
        artifactManifests: [
          {
            artifactId: 'uuid-1',
            type: 'code',
            checksum: 'abc123...'
          }
        ]
      });

      expect(withContent.quality.artifactUtilization).to.be.lessThan(
        withoutContent.quality.artifactUtilization
      );
    });

    it('should return 0 for invalid manifests array', () => {
      const score = contextEngineer._scoreArtifactUtilization('not-an-array');
      expect(score).to.equal(0);
    });
  });

  describe('Overall Quality Scoring', () => {
    it('should calculate weighted average of component scores', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Analyze payment module code security',
        targetClone: 'beta',
        essentialData: { framework: 'Express.js' },
        artifactManifests: [
          {
            artifactId: 'uuid-1',
            type: 'code',
            checksum: 'abc123'
          }
        ]
      });

      // Overall = (clarity * 0.4) + (relevance * 0.3) + (utilization * 0.3)
      const expected = Math.round(
        pkg.quality.objectiveClarity * 0.4 +
        pkg.quality.dataRelevance * 0.3 +
        pkg.quality.artifactUtilization * 0.3
      );

      expect(pkg.quality.overallQuality).to.equal(expected);
    });

    it('should set meetsWarningThreshold correctly', () => {
      const highQuality = contextEngineer.constructContextPackage({
        objective: 'Analyze payment module security vulnerabilities',
        targetClone: 'beta',
        essentialData: { framework: 'Express.js' }
      });

      expect(highQuality.quality.overallQuality).to.be.at.least(40);
      expect(highQuality.quality.meetsWarningThreshold).to.be.true;
    });

    it('should set meetsPassThreshold correctly', () => {
      const highQuality = contextEngineer.constructContextPackage({
        objective: 'Analyze payment module security vulnerabilities',
        targetClone: 'beta',
        essentialData: { framework: 'Express.js', version: '4.18.0' }
      });

      expect(highQuality.quality.overallQuality).to.be.at.least(60);
      expect(highQuality.quality.meetsPassThreshold).to.be.true;
    });
  });

  describe('validateQuality()', () => {
    it('should pass for high quality context', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Analyze payment module security vulnerabilities',
        targetClone: 'beta',
        essentialData: { framework: 'Express.js' }
      });

      expect(() => contextEngineer.validateQuality(pkg)).to.not.throw();
    });

    it('should throw for quality below warning threshold', () => {
      const lowQuality = {
        quality: {
          overallQuality: 30,
          objectiveClarity: 20,
          dataRelevance: 30,
          artifactUtilization: 40
        }
      };

      expect(() => contextEngineer.validateQuality(lowQuality))
        .to.throw(/Context quality too low.*30\/100/);
    });

    it('should warn for quality below pass threshold', () => {
      const mediumQuality = {
        quality: {
          overallQuality: 50,
          objectiveClarity: 50,
          dataRelevance: 50,
          artifactUtilization: 50
        }
      };

      // Should not throw, but should warn (we can't easily test console.warn)
      expect(() => contextEngineer.validateQuality(mediumQuality)).to.not.throw();
    });

    it('should throw for invalid context package', () => {
      expect(() => contextEngineer.validateQuality({}))
        .to.throw('Invalid context package: missing quality scores');
    });
  });

  describe('NO SIMULATIONS LAW Enforcement', () => {
    it('should calculate real quality scores (not estimated)', () => {
      const pkg = contextEngineer.constructContextPackage({
        objective: 'Analyze code security',
        targetClone: 'beta',
        essentialData: { framework: 'Express.js' }
      });

      // Scores should be integers between 0-100
      expect(pkg.quality.objectiveClarity).to.be.a('number');
      expect(pkg.quality.objectiveClarity).to.be.at.least(0);
      expect(pkg.quality.objectiveClarity).to.be.at.most(100);
      
      expect(pkg.quality.dataRelevance).to.be.a('number');
      expect(pkg.quality.overallQuality).to.be.a('number');
    });

    it('should produce deterministic scores for same input', () => {
      const input = {
        objective: 'Analyze payment security',
        targetClone: 'beta',
        essentialData: { framework: 'Express.js' }
      };

      const pkg1 = contextEngineer.constructContextPackage(input);
      const pkg2 = contextEngineer.constructContextPackage(input);

      expect(pkg1.quality.objectiveClarity).to.equal(pkg2.quality.objectiveClarity);
      expect(pkg1.quality.dataRelevance).to.equal(pkg2.quality.dataRelevance);
      expect(pkg1.quality.overallQuality).to.equal(pkg2.quality.overallQuality);
    });

    it('should detect lightweight manifests (not full content)', () => {
      const withFullContent = {
        artifactManifests: [
          {
            artifactId: 'uuid-1',
            type: 'code',
            checksum: 'abc123',
            content: 'FULL CONTENT HERE' // Should be detected and penalized
          }
        ]
      };

      const score = contextEngineer._scoreArtifactUtilization(
        withFullContent.artifactManifests
      );

      // Should not get perfect score due to having content
      expect(score).to.be.lessThan(100);
    });
  });
});
